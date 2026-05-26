package com.scsa.issuetracker.notification;

import com.scsa.issuetracker.global.entity.BaseTimeEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "notifications")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Notification extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "notifications_seq_gen")
    @SequenceGenerator(name = "notifications_seq_gen", sequenceName = "notifications_seq", allocationSize = 1)
    private Long id;

    @Column(nullable = false)
    private Long receiverId;

    @Column(nullable = false)
    private Long actorId;

    @Column(nullable = false)
    private Long projectId;

    @Column(nullable = false)
    private Long issueId;

    private Long commentId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private NotificationType notificationType;

    @Column(nullable = false, length = 500)
    private String message;

    private LocalDateTime readAt;

    private LocalDateTime deletedAt;

    private Notification(
            Long receiverId,
            Long actorId,
            Long projectId,
            Long issueId,
            Long commentId,
            NotificationType notificationType,
            String message
    ) {
        this.receiverId = receiverId;
        this.actorId = actorId;
        this.projectId = projectId;
        this.issueId = issueId;
        this.commentId = commentId;
        this.notificationType = notificationType;
        this.message = message;
    }

    public static Notification of(
            Long receiverId,
            Long actorId,
            Long projectId,
            Long issueId,
            Long commentId,
            NotificationType notificationType,
            String message
    ) {
        return new Notification(receiverId, actorId, projectId, issueId, commentId, notificationType, message);
    }

    public void markAsRead() {
        if (readAt == null) {
            readAt = LocalDateTime.now();
        }
    }

    public void delete() {
        if (deletedAt == null) {
            deletedAt = LocalDateTime.now();
        }
    }
}
