package com.scsa.issuetracker.issue.service;

import com.scsa.issuetracker.global.exception.BusinessException;
import com.scsa.issuetracker.global.exception.ErrorCode;
import com.scsa.issuetracker.issue.domain.Issue;
import com.scsa.issuetracker.issue.domain.IssuePriority;
import com.scsa.issuetracker.issue.domain.IssueStatus;
import com.scsa.issuetracker.issue.domain.IssueType;
import com.scsa.issuetracker.issue.dto.IssueCreateRequest;
import com.scsa.issuetracker.issue.dto.IssueResponse;
import com.scsa.issuetracker.issue.dto.IssueUpdateRequest;
import com.scsa.issuetracker.issue.repository.IssueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class IssueServiceImpl implements IssueService {

    private final IssueRepository issueRepository;

    @Override
    public IssueResponse createIssue(Long projectId, IssueCreateRequest request) {
        Issue issue = Issue.builder()
                .projectId(projectId)
                .reporterId(request.getReporterId())
                .assigneeId(request.getAssigneeId())
                .title(request.getTitle())
                .content(request.getContent())
                .issueType(request.getIssueType())
                .status(request.getStatus() != null ? request.getStatus() : IssueStatus.OPEN)
                .priority(request.getPriority())
                .build();

        return IssueResponse.from(issueRepository.save(issue));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<IssueResponse> getIssues(
            Long projectId,
            IssueStatus status,
            IssueType issueType,
            IssuePriority priority,
            Pageable pageable
    ) {
        if (status != null && issueType != null && priority != null) {
            return issueRepository.findByProjectIdAndStatusAndIssueTypeAndPriority(projectId, status, issueType, priority, pageable)
                    .map(IssueResponse::from);
        }
        if (status != null) {
            return issueRepository.findByProjectIdAndStatus(projectId, status, pageable)
                    .map(IssueResponse::from);
        }
        if (issueType != null) {
            return issueRepository.findByProjectIdAndIssueType(projectId, issueType, pageable)
                    .map(IssueResponse::from);
        }
        if (priority != null) {
            return issueRepository.findByProjectIdAndPriority(projectId, priority, pageable)
                    .map(IssueResponse::from);
        }

        return issueRepository.findByProjectId(projectId, pageable)
                .map(IssueResponse::from);
    }

    @Override
    @Transactional(readOnly = true)
    public IssueResponse getIssue(Long issueId) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ISSUE_NOT_FOUND));

        return IssueResponse.from(issue);
    }

    @Override
    public IssueResponse updateIssue(Long issueId, IssueUpdateRequest request) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ISSUE_NOT_FOUND));

        if (request.getAssigneeId() != null) {
            issue.setAssigneeId(request.getAssigneeId());
        }
        if (request.getTitle() != null) {
            issue.setTitle(request.getTitle());
        }
        if (request.getContent() != null) {
            issue.setContent(request.getContent());
        }
        if (request.getIssueType() != null) {
            issue.setIssueType(request.getIssueType());
        }
        if (request.getStatus() != null) {
            issue.setStatus(request.getStatus());
        }
        if (request.getPriority() != null) {
            issue.setPriority(request.getPriority());
        }

        return IssueResponse.from(issueRepository.save(issue));
    }

    @Override
    public void deleteIssue(Long issueId) {
        if (!issueRepository.existsById(issueId)) {
            throw new BusinessException(ErrorCode.ISSUE_NOT_FOUND);
        }

        issueRepository.deleteById(issueId);
    }
}
