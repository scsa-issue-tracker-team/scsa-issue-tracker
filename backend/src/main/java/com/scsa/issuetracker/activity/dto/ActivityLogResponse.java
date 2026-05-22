package com.scsa.issuetracker.activity.dto;

import com.scsa.issuetracker.activity.ActivityLog;
import com.scsa.issuetracker.activity.ActivityType;
import java.time.LocalDateTime;

public record ActivityLogResponse(
        Long id,
        Long projectId,
        Long issueId,
        Long actorId,
        ActivityType activityType,
        String message,
        LocalDateTime createdAt
) {

    public static ActivityLogResponse from(ActivityLog activityLog) {
        return new ActivityLogResponse(
                activityLog.getId(),
                activityLog.getProjectId(),
                activityLog.getIssueId(),
                activityLog.getActorId(),
                activityLog.getActivityType(),
                activityLog.getMessage(),
                activityLog.getCreatedAt()
        );
    }
}
