package com.scsa.issuetracker.comment.service;

import com.scsa.issuetracker.comment.dto.CommentCreateRequest;
import com.scsa.issuetracker.comment.dto.CommentPageResponse;
import com.scsa.issuetracker.comment.dto.CommentResponse;

public interface CommentService {
    CommentResponse create(Long projectId, Long issueId, CommentCreateRequest request);
    CommentPageResponse getList(Long projectId, Long issueId, int limit, int offset);
    CommentResponse createReply(Long projectId, Long issueId, Long commentId, CommentCreateRequest request);
    CommentPageResponse getReplies(Long projectId, Long issueId, Long commentId, int limit, int offset);
}
