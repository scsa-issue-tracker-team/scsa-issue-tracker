package com.scsa.issuetracker.issue.dto;
import com.scsa.issuetracker.issue.domain.IssuePriority;
import com.scsa.issuetracker.issue.domain.IssueStatus;
import com.scsa.issuetracker.issue.domain.IssueType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor

public class IssueCreateRequest {
    @NotNull
    private Long reporterId;

    private Long assigneeId;

    @NotBlank
    private String title;

    private String content;

    @NotNull
    private IssueType issueType;

    private IssueStatus status;

    @NotNull
    private IssuePriority priority;
}
