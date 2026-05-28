package com.scsa.issuetracker.projectmember.dto;

import com.scsa.issuetracker.projectmember.ProjectMemberRole;
import jakarta.validation.constraints.NotNull;

public record ProjectMemberRoleUpdateRequest(
        @NotNull(message = "변경할 역할은 필수입니다.")
        ProjectMemberRole role
) {
}
