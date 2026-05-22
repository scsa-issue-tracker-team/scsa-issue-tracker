package com.scsa.issuetracker.comment.service;

import com.scsa.issuetracker.comment.dto.CommentCreateRequest;
import com.scsa.issuetracker.comment.dto.CommentPageResponse;
import com.scsa.issuetracker.comment.dto.CommentResponse;

public interface CommentService {
    CommentResponse create(Long projectId, Long issueId, CommentCreateRequest request);
    CommentPageResponse getList(Long projectId, Long issueId, int limit, int offset);
}