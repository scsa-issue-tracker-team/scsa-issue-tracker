package com.scsa.issuetracker.issue.dto;

import com.scsa.issuetracker.issue.domain.IssueStatus;
import jakarta.validation.constraints.NotNull;

public record IssueStatusUpdateRequest(
        @NotNull
        IssueStatus status
) {
}
