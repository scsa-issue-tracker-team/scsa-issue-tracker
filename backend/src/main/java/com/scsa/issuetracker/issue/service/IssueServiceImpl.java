package com.scsa.issuetracker.issue.service;

import com.scsa.issuetracker.global.exception.BusinessException;
import com.scsa.issuetracker.global.exception.ErrorCode;
import com.scsa.issuetracker.global.security.SecurityUtil;
import com.scsa.issuetracker.issue.domain.Issue;
import com.scsa.issuetracker.issue.domain.IssuePriority;
import com.scsa.issuetracker.issue.domain.IssueStatus;
import com.scsa.issuetracker.issue.domain.IssueType;
import com.scsa.issuetracker.issue.dto.IssueCreateRequest;
import com.scsa.issuetracker.issue.dto.IssueResponse;
import com.scsa.issuetracker.issue.dto.IssueStatusUpdateRequest;
import com.scsa.issuetracker.issue.dto.IssueUpdateRequest;
import com.scsa.issuetracker.issue.repository.IssueRepository;
import com.scsa.issuetracker.project.entity.Project;
import com.scsa.issuetracker.projectmember.ProjectAccessValidator;
import com.scsa.issuetracker.projectmember.ProjectMemberRepository;
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
    private final ProjectAccessValidator projectAccessValidator;
    private final ProjectMemberRepository projectMemberRepository;

    @Override
    public IssueResponse createIssue(Long projectId, IssueCreateRequest request) {
        Project project = projectAccessValidator.getAccessibleProject(projectId);
        validateAssignee(project, request.getAssigneeId());

        Long currentUserId = SecurityUtil.getCurrentUserId();

        Issue issue = Issue.builder()
                .projectId(projectId)
                .reporterId(currentUserId)
                .assigneeId(request.getAssigneeId())
                .title(request.getTitle())
                .content(request.getContent())
                .issueType(request.getIssueType())
                .status(IssueStatus.OPEN)
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
        projectAccessValidator.getAccessibleProject(projectId);

        return issueRepository.findByProjectIdWithFilters(projectId, status, issueType, priority, pageable)
                .map(IssueResponse::from);
    }

    @Override
    @Transactional(readOnly = true)
    public IssueResponse getIssue(Long projectId, Long issueId) {
        Issue issue = getIssueInProject(projectId, issueId);

        return IssueResponse.from(issue);
    }

    @Override
    public IssueResponse updateIssue(Long projectId, Long issueId, IssueUpdateRequest request) {
        Issue issue = getIssueInProject(projectId, issueId);

        if (request.getAssigneeId() != null) {
            Project project = projectAccessValidator.getAccessibleProject(projectId);
            validateAssignee(project, request.getAssigneeId());
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
        if (request.getPriority() != null) {
            issue.setPriority(request.getPriority());
        }

        return IssueResponse.from(issueRepository.save(issue));
    }

    @Override
    public IssueResponse updateIssueStatus(Long projectId, Long issueId, IssueStatusUpdateRequest request) {
        Issue issue = getIssueInProject(projectId, issueId);
        issue.setStatus(request.status());

        return IssueResponse.from(issueRepository.save(issue));
    }

    @Override
    public void deleteIssue(Long projectId, Long issueId) {
        Issue issue = getIssueInProject(projectId, issueId);

        issueRepository.delete(issue);
    }

    private Issue getIssueInProject(Long projectId, Long issueId) {
        projectAccessValidator.getAccessibleProject(projectId);

        return issueRepository.findByIdAndProjectId(issueId, projectId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ISSUE_NOT_FOUND));
    }

    private void validateAssignee(Project project, Long assigneeId) {
        if (assigneeId == null) {
            return;
        }

        boolean isCreator = project.getCreatedById().getId().equals(assigneeId);
        boolean isMember = projectMemberRepository.existsByProject_IdAndUser_Id(project.getId(), assigneeId);

        if (!isCreator && !isMember) {
            throw new BusinessException(ErrorCode.INVALID_ISSUE_ASSIGNEE);
        }
    }
}
