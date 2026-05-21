package com.scsa.issuetracker.issue.service;

import com.scsa.issuetracker.issue.domain.IssuePriority;
import com.scsa.issuetracker.issue.domain.IssueStatus;
import com.scsa.issuetracker.issue.domain.IssueType;
import com.scsa.issuetracker.issue.dto.IssueCreateRequest;
import com.scsa.issuetracker.issue.dto.IssueResponse;
import com.scsa.issuetracker.issue.dto.IssueUpdateRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface IssueService {
    IssueResponse createIssue(Long projectId, IssueCreateRequest request);
    Page<IssueResponse> getIssues(Long projectId, IssueStatus status, IssueType issueType, IssuePriority priority, Pageable pageable);
    IssueResponse getIssue(Long issueId);
    IssueResponse updateIssue(Long issueId, IssueUpdateRequest request);
    void deleteIssue(Long issueId);
}
