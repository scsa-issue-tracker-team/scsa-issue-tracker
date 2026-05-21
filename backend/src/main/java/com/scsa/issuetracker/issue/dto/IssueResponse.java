package com.scsa.issuetracker.issue.dto;

import com.scsa.issuetracker.issue.domain.Issue;
import com.scsa.issuetracker.issue.domain.IssuePriority;
import com.scsa.issuetracker.issue.domain.IssueStatus;
import com.scsa.issuetracker.issue.domain.IssueType;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder

public class IssueResponse {
    private Long id;
    private Long projectId;
    private Long assigneeId;
    private String title;
    private String content;
    private IssueType issueType;
    private IssueStatus status;
    private IssuePriority priority;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static IssueResponse from(Issue issue) {
        return IssueResponse.builder()
                .id(issue.getId())
                .projectId(issue.getProjectId())
                .reporterId(issue.getReporterId())
                .assigneeId(issue.getAssigneeId())
                .title(issue.getTitle())
                .content(issue.getContent())
                .issueType(issue.getIssueType())
                .status(issue.getStatus())
                .priority(issue.getPriority())
                .createdAt(issue.getCreatedAt())
                .updatedAt(issue.getUpdatedAt())
                .build();
    }
}