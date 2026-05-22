package com.scsa.issuetracker.projectmember;

import com.scsa.issuetracker.global.exception.BusinessException;
import com.scsa.issuetracker.global.exception.ErrorCode;
import com.scsa.issuetracker.project.entity.Project;
import com.scsa.issuetracker.projectmember.dto.ProjectMemberAddRequest;
import com.scsa.issuetracker.projectmember.dto.ProjectMemberResponse;
import com.scsa.issuetracker.user.entity.User;
import com.scsa.issuetracker.user.repository.UserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProjectMemberService {

    private final ProjectAccessValidator projectAccessValidator;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;

    @Transactional
    public ProjectMemberResponse addMember(Long projectId, ProjectMemberAddRequest request) {
        Project project = projectAccessValidator.getOwnerProject(projectId);
        User user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        if (projectMemberRepository.existsByProject_IdAndUser_Id(projectId, user.getId())) {
            throw new BusinessException(ErrorCode.DUPLICATE_PROJECT_MEMBER);
        }

        ProjectMember member = ProjectMember.member(project, user);
        ProjectMember savedMember = projectMemberRepository.save(member);

        return ProjectMemberResponse.from(savedMember);
    }

    public List<ProjectMemberResponse> getMembers(Long projectId) {
        projectAccessValidator.getAccessibleProject(projectId);

        return projectMemberRepository.findByProject_Id(projectId)
                .stream()
                .map(ProjectMemberResponse::from)
                .toList();
    }

    @Transactional
    public void removeMember(Long projectId, Long userId) {
        Project project = projectAccessValidator.getOwnerProject(projectId);

        ProjectMember member = projectMemberRepository.findByProject_IdAndUser_Id(projectId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PROJECT_MEMBER_NOT_FOUND));

        if (member.getRole() == ProjectMemberRole.OWNER || project.getCreatedById().getId().equals(userId)) {
            throw new BusinessException(ErrorCode.PROJECT_OWNER_CANNOT_BE_REMOVED);
        }

        projectMemberRepository.delete(member);
    }
}
