package com.scsa.issuetracker.notification.dto;

import com.scsa.issuetracker.notification.Notification;
import com.scsa.issuetracker.notification.NotificationType;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class NotificationResponse {

    private Long id;
    private Long receiverId;
    private Long actorId;
    private Long projectId;
    private Long issueId;
    private Long commentId;
    private NotificationType notificationType;
    private String message;
    private boolean read;
    private LocalDateTime readAt;
    private LocalDateTime createdAt;

    public static NotificationResponse from(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .receiverId(notification.getReceiverId())
                .actorId(notification.getActorId())
                .projectId(notification.getProjectId())
                .issueId(notification.getIssueId())
                .commentId(notification.getCommentId())
                .notificationType(notification.getNotificationType())
                .message(notification.getMessage())
                .read(notification.getReadAt() != null)
                .readAt(notification.getReadAt())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
