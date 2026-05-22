package com.scsa.issuetracker.projectmember.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ProjectMemberAddRequest(
        @NotBlank(message = "추가할 사용자 이름은 필수입니다.")
        @Size(max = 50, message = "사용자 이름은 50자 이하여야 합니다.")
        String username
) {
}
