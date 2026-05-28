package com.scsa.issuetracker.dashboard.dto;

import com.scsa.issuetracker.activity.ActivityType;
import java.time.LocalDate;
import java.util.Map;

public record DashboardActivityDailyResponse(
        LocalDate date,
        long activityCount,
        Map<ActivityType, Long> breakdown
) {

    public static DashboardActivityDailyResponse from(
            LocalDate date,
            Map<ActivityType, Long> breakdown
    ) {
        long activityCount = breakdown.values()
                .stream()
                .mapToLong(Long::longValue)
                .sum();

        return new DashboardActivityDailyResponse(date, activityCount, breakdown);
    }
}
