package com.scsa.issuetracker.activity;

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
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "activity_logs")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ActivityLog extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "activity_logs_seq_gen")
    @SequenceGenerator(name = "activity_logs_seq_gen", sequenceName = "activity_logs_seq", allocationSize = 1)
    private Long id;

    @Column(nullable = false)
    private Long projectId;

    @Column(nullable = false)
    private Long issueId;

    @Column(nullable = false)
    private Long actorId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private ActivityType activityType;

    @Column(nullable = false, length = 500)
    private String message;

    private ActivityLog(
            Long projectId,
            Long issueId,
            Long actorId,
            ActivityType activityType,
            String message
    ) {
        this.projectId = projectId;
        this.issueId = issueId;
        this.actorId = actorId;
        this.activityType = activityType;
        this.message = message;
    }

    public static ActivityLog of(
            Long projectId,
            Long issueId,
            Long actorId,
            ActivityType activityType,
            String message
    ) {
        return new ActivityLog(projectId, issueId, actorId, activityType, message);
    }
}
