package com.scsa.issuetracker.auth.dto;

import com.scsa.issuetracker.user.entity.User;

public record CurrentUserResponse(
        Long userId,
        String username
) {

    public static CurrentUserResponse from(User user) {
        return new CurrentUserResponse(
                user.getId(),
                user.getUsername()
        );
    }
}
