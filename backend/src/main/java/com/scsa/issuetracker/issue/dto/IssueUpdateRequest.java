package com.scsa.issuetracker.issue.dto;

import com.scsa.issuetracker.issue.domain.IssuePriority;
import com.scsa.issuetracker.issue.domain.IssueStatus;
import com.scsa.issuetracker.issue.domain.IssueType;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor

public class IssueUpdateRequest {
    private Long assigneeId;
    private String title;
    private String content;
    private IssueType issueType;
    private IssueStatus status;
    private IssuePriority priority;
}
