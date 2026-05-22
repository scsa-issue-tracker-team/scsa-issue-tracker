package com.scsa.issuetracker.projectmember.dto;

import com.scsa.issuetracker.projectmember.ProjectMember;
import com.scsa.issuetracker.projectmember.ProjectMemberRole;
import java.time.LocalDateTime;

public record ProjectMemberResponse(
        Long id,
        Long projectId,
        Long userId,
        String username,
        ProjectMemberRole role,
        LocalDateTime createdAt
) {
    public static ProjectMemberResponse from(ProjectMember member) {
        return new ProjectMemberResponse(
                member.getId(),
                member.getProject().getId(),
                member.getUser().getId(),
                member.getUser().getUsername(),
                member.getRole(),
                member.getCreatedAt()
        );
    }
}
