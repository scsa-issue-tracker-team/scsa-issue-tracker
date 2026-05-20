package com.scsa.issuetracker.comment.service;

import com.scsa.issuetracker.comment.dto2.CommentCreateRequest;
import com.scsa.issuetracker.comment.dto2.CommentPageResponse;
import com.scsa.issuetracker.comment.dto2.CommentResponse;

public interface CommentService {
    CommentResponse create(Long projectId, Long issueId, CommentCreateRequest request);
    CommentPageResponse getList(Long projectId, Long issueId, int limit, int offset);
}