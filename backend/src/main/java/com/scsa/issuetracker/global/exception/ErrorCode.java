package com.scsa.issuetracker.global.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    INVALID_REQUEST(HttpStatus.BAD_REQUEST, "잘못된 요청입니다."),

    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "인증이 필요합니다."),
    LOGIN_FAILED(HttpStatus.UNAUTHORIZED, "아이디 또는 비밀번호가 올바르지 않습니다."),
    FORBIDDEN(HttpStatus.FORBIDDEN, "권한이 없습니다."),

    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."),
    PROJECT_NOT_FOUND(HttpStatus.NOT_FOUND, "프로젝트를 찾을 수 없습니다."),
    ISSUE_NOT_FOUND(HttpStatus.NOT_FOUND, "이슈를 찾을 수 없습니다."),
    COMMENT_NOT_FOUND(HttpStatus.NOT_FOUND, "댓글을 찾을 수 없습니다."),
    PROJECT_MEMBER_NOT_FOUND(HttpStatus.NOT_FOUND, "프로젝트 멤버를 찾을 수 없습니다."),
    NOTIFICATION_NOT_FOUND(HttpStatus.NOT_FOUND, "알림을 찾을 수 없습니다."),

    DUPLICATE_EMAIL(HttpStatus.CONFLICT, "이미 사용 중인 이메일입니다."),
    DUPLICATE_USERNAME(HttpStatus.CONFLICT, "이미 사용 중인 사용자 이름입니다."),
    DUPLICATE_PROJECT_NAME(HttpStatus.CONFLICT, "이미 사용 중인 프로젝트 이름입니다."),
    DUPLICATE_PROJECT_MEMBER(HttpStatus.CONFLICT, "이미 프로젝트에 참여 중인 사용자입니다."),

    PROJECT_OWNER_CANNOT_BE_REMOVED(HttpStatus.BAD_REQUEST, "프로젝트 소유자는 제거할 수 없습니다."),
    INVALID_ISSUE_ASSIGNEE(HttpStatus.BAD_REQUEST, "담당자는 프로젝트 멤버여야 합니다.");

    private final HttpStatus status;
    private final String message;
}
