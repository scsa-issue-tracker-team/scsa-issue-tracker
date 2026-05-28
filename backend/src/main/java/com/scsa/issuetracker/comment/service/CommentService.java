package com.scsa.issuetracker.comment.service;

import com.scsa.issuetracker.comment.dto.CommentCreateRequest;
import com.scsa.issuetracker.comment.dto.CommentPageResponse;
import com.scsa.issuetracker.comment.dto.CommentResponse;
import com.scsa.issuetracker.comment.dto.CommentUpdateRequest;

public interface CommentService {
    CommentResponse create(Long projectId, Long issueId, CommentCreateRequest request);
    CommentPageResponse getList(Long projectId, Long issueId, int limit, int offset);
    CommentResponse update(Long projectId, Long issueId, Long commentId, CommentUpdateRequest request);
    void delete(Long projectId, Long issueId, Long commentId);
    CommentResponse createReply(Long projectId, Long issueId, Long commentId, CommentCreateRequest request);
    CommentPageResponse getReplies(Long projectId, Long issueId, Long commentId, int limit, int offset);
    CommentResponse updateReply(Long projectId, Long issueId, Long commentId, Long replyId, CommentUpdateRequest request);
    void deleteReply(Long projectId, Long issueId, Long commentId, Long replyId);
}
