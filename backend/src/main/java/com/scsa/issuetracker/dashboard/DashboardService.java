package com.scsa.issuetracker.dashboard;

import com.scsa.issuetracker.activity.ActivityLog;
import com.scsa.issuetracker.activity.ActivityLogRepository;
import com.scsa.issuetracker.activity.ActivityType;
import com.scsa.issuetracker.dashboard.dto.DashboardActivityDailyResponse;
import com.scsa.issuetracker.global.security.SecurityUtil;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private static final int DEFAULT_DAYS = 84;
    private static final int MIN_DAYS = 1;
    private static final int MAX_DAYS = 365;

    private final ActivityLogRepository activityLogRepository;

    public List<DashboardActivityDailyResponse> getMyActivityDaily(Integer days) {
        int normalizedDays = normalizeDays(days);
        Long currentUserId = SecurityUtil.getCurrentUserId();
        LocalDate today = LocalDate.now();
        LocalDate startDate = today.minusDays(normalizedDays - 1L);
        LocalDateTime from = startDate.atStartOfDay();

        Map<LocalDate, Map<ActivityType, Long>> dailyCounts = createEmptyDailyCounts(startDate, normalizedDays);

        activityLogRepository.findByActorIdAndCreatedAtGreaterThanEqualOrderByCreatedAtAsc(currentUserId, from)
                .forEach(activityLog -> addActivityCount(dailyCounts, activityLog));

        return dailyCounts.entrySet()
                .stream()
                .map(entry -> DashboardActivityDailyResponse.from(entry.getKey(), entry.getValue()))
                .toList();
    }

    private int normalizeDays(Integer days) {
        if (days == null) {
            return DEFAULT_DAYS;
        }
        return Math.min(Math.max(days, MIN_DAYS), MAX_DAYS);
    }

    private Map<LocalDate, Map<ActivityType, Long>> createEmptyDailyCounts(LocalDate startDate, int days) {
        Map<LocalDate, Map<ActivityType, Long>> dailyCounts = new LinkedHashMap<>();
        for (int i = 0; i < days; i++) {
            dailyCounts.put(startDate.plusDays(i), new EnumMap<>(ActivityType.class));
        }
        return dailyCounts;
    }

    private void addActivityCount(
            Map<LocalDate, Map<ActivityType, Long>> dailyCounts,
            ActivityLog activityLog
    ) {
        LocalDate activityDate = activityLog.getCreatedAt().toLocalDate();
        Map<ActivityType, Long> breakdown = dailyCounts.get(activityDate);
        if (breakdown == null) {
            return;
        }
        breakdown.merge(activityLog.getActivityType(), 1L, Long::sum);
    }
}
