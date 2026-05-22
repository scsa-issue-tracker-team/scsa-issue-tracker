package com.scsa.issuetracker.project.service;

import com.scsa.issuetracker.global.exception.BusinessException;
import com.scsa.issuetracker.global.exception.ErrorCode;
import com.scsa.issuetracker.global.security.SecurityUtil;
import com.scsa.issuetracker.project.dto.ProjectCreateRequest;
import com.scsa.issuetracker.project.dto.ProjectResponse;
import com.scsa.issuetracker.project.entity.Project;
import com.scsa.issuetracker.project.repository.ProjectRepository;
import com.scsa.issuetracker.projectmember.ProjectAccessValidator;
import com.scsa.issuetracker.projectmember.ProjectMember;
import com.scsa.issuetracker.projectmember.ProjectMemberRepository;
import com.scsa.issuetracker.user.entity.User;
import com.scsa.issuetracker.user.repository.UserRepository;
import java.util.LinkedHashMap;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final ProjectAccessValidator projectAccessValidator;

    public List<ProjectResponse> getMyProjects() {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        Map<Long, Project> projects = new LinkedHashMap<>();

        projectRepository.findByCreatedById_Id(currentUserId)
                .stream()
                .forEach(project -> projects.put(project.getId(), project));

        projectMemberRepository.findByUser_Id(currentUserId)
                .stream()
                .map(ProjectMember::getProject)
                .forEach(project -> projects.put(project.getId(), project));

        return projects.values()
                .stream()
                .map(ProjectResponse::from)
                .toList();
    }

    public ProjectResponse getProject(Long projectId) {
        Project project = projectAccessValidator.getAccessibleProject(projectId);

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
        projectMemberRepository.save(ProjectMember.owner(savedProject, creator));

        return ProjectResponse.from(savedProject);
    }
}
