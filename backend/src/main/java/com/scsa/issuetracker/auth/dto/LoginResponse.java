package com.scsa.issuetracker.auth.dto;

public record LoginResponse(
        String tokenType,
        String accessToken
) {
}
