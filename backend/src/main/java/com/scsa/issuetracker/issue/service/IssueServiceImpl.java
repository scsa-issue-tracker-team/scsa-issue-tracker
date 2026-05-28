package com.scsa.issuetracker.issue.service;

import com.scsa.issuetracker.activity.ActivityLogService;
import com.scsa.issuetracker.activity.ActivityType;
import com.scsa.issuetracker.global.exception.BusinessException;
import com.scsa.issuetracker.global.exception.ErrorCode;
import com.scsa.issuetracker.global.security.SecurityUtil;
import com.scsa.issuetracker.issue.domain.Issue;
import com.scsa.issuetracker.issue.domain.IssuePriority;
import com.scsa.issuetracker.issue.domain.IssueStatus;
import com.scsa.issuetracker.issue.domain.IssueType;
import com.scsa.issuetracker.issue.domain.MyIssueRole;
import com.scsa.issuetracker.issue.dto.IssueCreateRequest;
import com.scsa.issuetracker.issue.dto.IssueResponse;
import com.scsa.issuetracker.issue.dto.IssueStatusUpdateRequest;
import com.scsa.issuetracker.issue.dto.IssueUpdateRequest;
import com.scsa.issuetracker.issue.dto.MyIssueSummaryResponse;
import com.scsa.issuetracker.issue.repository.IssueRepository;
import com.scsa.issuetracker.notification.NotificationService;
import com.scsa.issuetracker.project.entity.Project;
import com.scsa.issuetracker.projectmember.ProjectAccessValidator;
import com.scsa.issuetracker.projectmember.ProjectMemberRepository;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
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
    private final ActivityLogService activityLogService;
    private final NotificationService notificationService;

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
                .dueDate(request.getDueDate())
                .build();

        Issue savedIssue = issueRepository.save(issue);
        activityLogService.record(
                projectId,
                savedIssue.getId(),
                currentUserId,
                ActivityType.ISSUE_CREATED,
                "이슈가 생성되었습니다."
        );
        notificationService.notifyIssueAssigned(
                projectId,
                savedIssue.getId(),
                currentUserId,
                savedIssue.getAssigneeId()
        );

        return IssueResponse.from(savedIssue);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<IssueResponse> getIssues(
            Long projectId,
            IssueStatus status,
            IssueType issueType,
            IssuePriority priority,
            Long assigneeId,
            Long reporterId,
            LocalDate dueDateFrom,
            LocalDate dueDateTo,
            String keyword,
            Pageable pageable
    ) {
        projectAccessValidator.getAccessibleProject(projectId);

        return issueRepository.findByProjectIdWithFilters(
                        projectId,
                        status,
                        issueType,
                        priority,
                        assigneeId,
                        reporterId,
                        dueDateFrom,
                        dueDateTo,
                        normalizeKeyword(keyword),
                        pageable
                )
                .map(IssueResponse::from);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<IssueResponse> getMyIssues(MyIssueRole role, IssueStatus status, Pageable pageable) {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        MyIssueRole selectedRole = role == null ? MyIssueRole.ALL : role;

        return (switch (selectedRole) {
            case ASSIGNEE -> issueRepository.findAssignedToUser(currentUserId, status, pageable);
            case REPORTER -> issueRepository.findReportedByUser(currentUserId, status, pageable);
            case ALL -> issueRepository.findRelatedToUser(currentUserId, status, pageable);
        }).map(IssueResponse::from);
    }

    @Override
    @Transactional(readOnly = true)
    public MyIssueSummaryResponse getMyIssueSummary() {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        LocalDate today = LocalDate.now();
        List<IssueStatus> closedStatuses = List.of(IssueStatus.RESOLVED, IssueStatus.CLOSED);

        Map<IssueStatus, Long> statusCounts = new EnumMap<>(IssueStatus.class);
        Arrays.stream(IssueStatus.values())
                .forEach(status -> statusCounts.put(
                        status,
                        issueRepository.countRelatedToUserByStatus(currentUserId, status)
                ));

        return new MyIssueSummaryResponse(
                issueRepository.countRelatedToUser(currentUserId),
                issueRepository.countByAssigneeId(currentUserId),
                issueRepository.countByReporterId(currentUserId),
                issueRepository.countOverdueRelatedToUser(currentUserId, today, closedStatuses),
                issueRepository.countDueSoonRelatedToUser(currentUserId, today, today.plusDays(7), closedStatuses),
                statusCounts
        );
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
        Long currentUserId = SecurityUtil.getCurrentUserId();
        boolean changed = false;

        if (request.getAssigneeId() != null) {
            Project project = projectAccessValidator.getAccessibleProject(projectId);
            validateAssignee(project, request.getAssigneeId());
            Long previousAssigneeId = issue.getAssigneeId();
            issue.setAssigneeId(request.getAssigneeId());
            if (!request.getAssigneeId().equals(previousAssigneeId)) {
                activityLogService.record(
                        projectId,
                        issueId,
                        currentUserId,
                        ActivityType.ISSUE_ASSIGNEE_CHANGED,
                        "담당자가 변경되었습니다."
                );
                notificationService.notifyIssueAssigned(
                        projectId,
                        issueId,
                        currentUserId,
                        request.getAssigneeId()
                );
            }
            changed = true;
        }
        if (request.getTitle() != null) {
            issue.setTitle(request.getTitle());
            changed = true;
        }
        if (request.getContent() != null) {
            issue.setContent(request.getContent());
            changed = true;
        }
        if (request.getIssueType() != null) {
            issue.setIssueType(request.getIssueType());
            changed = true;
        }
        if (request.getPriority() != null) {
            issue.setPriority(request.getPriority());
            changed = true;
        }
        if (request.getDueDate() != null) {
            issue.setDueDate(request.getDueDate());
            changed = true;
        }

        if (changed) {
            activityLogService.record(
                    projectId,
                    issueId,
                    currentUserId,
                    ActivityType.ISSUE_UPDATED,
                    "이슈 정보가 수정되었습니다."
            );
        }

        return IssueResponse.from(issueRepository.save(issue));
    }

    @Override
    public IssueResponse updateIssueStatus(Long projectId, Long issueId, IssueStatusUpdateRequest request) {
        Issue issue = getIssueInProject(projectId, issueId);
        Long currentUserId = SecurityUtil.getCurrentUserId();
        issue.setStatus(request.status());
        activityLogService.record(
                projectId,
                issueId,
                currentUserId,
                ActivityType.ISSUE_STATUS_CHANGED,
                "이슈 상태가 " + request.status() + "(으)로 변경되었습니다."
        );
        notificationService.notifyIssueStatusChanged(
                projectId,
                issueId,
                currentUserId,
                Arrays.asList(issue.getReporterId(), issue.getAssigneeId()),
                request.status().name()
        );

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

    private String normalizeKeyword(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return null;
        }

        return keyword.trim();
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
