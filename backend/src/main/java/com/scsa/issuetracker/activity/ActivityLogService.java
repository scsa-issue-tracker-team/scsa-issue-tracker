package com.scsa.issuetracker.activity;

import com.scsa.issuetracker.activity.dto.ActivityLogResponse;
import com.scsa.issuetracker.global.exception.BusinessException;
import com.scsa.issuetracker.global.exception.ErrorCode;
import com.scsa.issuetracker.issue.repository.IssueRepository;
import com.scsa.issuetracker.projectmember.ProjectAccessValidator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;
    private final IssueRepository issueRepository;
    private final ProjectAccessValidator projectAccessValidator;

    @Transactional
    public void record(
            Long projectId,
            Long issueId,
            Long actorId,
            ActivityType activityType,
            String message
    ) {
        ActivityLog activityLog = ActivityLog.of(projectId, issueId, actorId, activityType, message);
        activityLogRepository.save(activityLog);
    }

    public List<ActivityLogResponse> getIssueActivities(Long projectId, Long issueId) {
        projectAccessValidator.getAccessibleProject(projectId);
        issueRepository.findByIdAndProjectId(issueId, projectId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ISSUE_NOT_FOUND));

        return activityLogRepository.findByProjectIdAndIssueIdOrderByCreatedAtAsc(projectId, issueId)
                .stream()
                .map(ActivityLogResponse::from)
                .toList();
    }
}
