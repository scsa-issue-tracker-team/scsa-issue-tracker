package com.scsa.issuetracker.issue.service;

import com.scsa.issuetracker.issue.domain.IssuePriority;
import com.scsa.issuetracker.issue.domain.IssueStatus;
import com.scsa.issuetracker.issue.domain.IssueType;
import com.scsa.issuetracker.issue.domain.MyIssueRole;
import com.scsa.issuetracker.issue.dto.IssueCreateRequest;
import com.scsa.issuetracker.issue.dto.IssueResponse;
import com.scsa.issuetracker.issue.dto.IssueStatusUpdateRequest;
import com.scsa.issuetracker.issue.dto.IssueUpdateRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface IssueService {

    IssueResponse createIssue(Long projectId, IssueCreateRequest request);

    Page<IssueResponse> getIssues(
            Long projectId,
            IssueStatus status,
            IssueType issueType,
            IssuePriority priority,
            Pageable pageable
    );

    Page<IssueResponse> getMyIssues(MyIssueRole role, IssueStatus status, Pageable pageable);

    IssueResponse getIssue(Long projectId, Long issueId);

    IssueResponse updateIssue(Long projectId, Long issueId, IssueUpdateRequest request);

    IssueResponse updateIssueStatus(Long projectId, Long issueId, IssueStatusUpdateRequest request);

    void deleteIssue(Long projectId, Long issueId);
}
