package com.scsa.issuetracker.projectmember;

import com.scsa.issuetracker.global.exception.BusinessException;
import com.scsa.issuetracker.global.exception.ErrorCode;
import com.scsa.issuetracker.global.security.SecurityUtil;
import com.scsa.issuetracker.project.entity.Project;
import com.scsa.issuetracker.project.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ProjectAccessValidator {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;

    public Project getAccessibleProject(Long projectId) {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        Project project = findProject(projectId);

        if (isCreator(project, currentUserId)
                || projectMemberRepository.existsByProject_IdAndUser_Id(projectId, currentUserId)) {
            return project;
        }

        throw new BusinessException(ErrorCode.PROJECT_NOT_FOUND);
    }

    public Project getOwnerProject(Long projectId) {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        Project project = findProject(projectId);

        if (isCreator(project, currentUserId)
                || projectMemberRepository.existsByProject_IdAndUser_IdAndRole(
                projectId,
                currentUserId,
                ProjectMemberRole.OWNER
        )) {
            return project;
        }

        throw new BusinessException(ErrorCode.FORBIDDEN);
    }

    private Project findProject(Long projectId) {
        return projectRepository.findById(projectId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PROJECT_NOT_FOUND));
    }

    private boolean isCreator(Project project, Long userId) {
        return project.getCreatedById().getId().equals(userId);
    }
}
