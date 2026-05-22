package com.scsa.issuetracker.projectmember.dto;

import jakarta.validation.constraints.NotBlank;

public record ProjectMemberAddRequest(
        @NotBlank
        String username
) {
}
