package com.scsa.issuetracker.common.exception;

public class IssueNotFoundException extends RuntimeException {
    public IssueNotFoundException(Long issueId) {
        super("이슈 미발견: " + issueId);
    }
}