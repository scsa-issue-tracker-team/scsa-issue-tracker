package com.scsa.issuetracker.project.service;

import com.scsa.issuetracker.global.exception.BusinessException;
import com.scsa.issuetracker.global.exception.ErrorCode;
import com.scsa.issuetracker.global.security.SecurityUtil;
import com.scsa.issuetracker.project.dto.ProjectCreateRequest;
import com.scsa.issuetracker.project.dto.ProjectResponse;
import com.scsa.issuetracker.project.entity.Project;
import com.scsa.issuetracker.project.repository.ProjectRepository;
import com.scsa.issuetracker.user.entity.User;
import com.scsa.issuetracker.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public List<ProjectResponse> getMyProjects() {
        Long currentUserId = SecurityUtil.getCurrentUserId();

        return projectRepository.findByCreatedById_Id(currentUserId)
                .stream()
                .map(ProjectResponse::from)
                .toList();
    }

    public ProjectResponse getProject(Long projectId) {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        Project project = getOwnedProject(projectId, currentUserId);

        return ProjectResponse.from(project);
    }

    @Transactional
    public ProjectResponse createProject(ProjectCreateRequest request) {
        Long currentUserId = SecurityUtil.getCurrentUserId();

        if (projectRepository.existsByCreatedById_IdAndName(currentUserId, request.name())) {
            throw new BusinessException(ErrorCode.DUPLICATE_PROJECT_NAME);
        }

        User creator = userRepository.findById(currentUserId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        Project project = Project.create(creator, request.name(), request.description());
        Project savedProject = projectRepository.save(project);

        return ProjectResponse.from(savedProject);
    }

    private Project getOwnedProject(Long projectId, Long currentUserId) {
        return projectRepository.findByIdAndCreatedById_Id(projectId, currentUserId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PROJECT_NOT_FOUND));
    }
}
