package com.scsa.issuetracker.global.security;

import com.scsa.issuetracker.global.exception.BusinessException;
import com.scsa.issuetracker.global.exception.ErrorCode;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtil {

    private SecurityUtil() {
    }

    public static Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !(authentication.getPrincipal() instanceof Long userId)) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }

        return userId;
    }
}
