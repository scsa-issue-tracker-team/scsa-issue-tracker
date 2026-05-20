package com.scsa.issuetracker.issue.domain;

import com.scsa.issuetracker.common.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "issues")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Issue extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "issues_seq")
    @SequenceGenerator(name = "issues_seq", sequenceName = "issues_seq", allocationSize = 1)
    private Long id;

    @Column(nullable = false)
    private Long reporterId;

    private Long assigneeId;

    @Column(nullable = false)
    private Long projectId;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "CLOB")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private IssueType issueType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private IssueStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private IssuePriority priority;
}