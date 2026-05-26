package com.scsa.issuetracker.comment.dto;

import com.scsa.issuetracker.comment.domain.Comment;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class CommentResponse {

    private Long id;
    private Long authorId;
    private Long issueId;
    private Long parentId;
    private String content;
    private boolean deleted;
    private long replyCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static CommentResponse from(Comment comment) {
        return from(comment, 0);
    }

    public static CommentResponse from(Comment comment, long replyCount) {
        return CommentResponse.builder()
                .id(comment.getId())
                .authorId(comment.getAuthorId())
                .issueId(comment.getIssueId())
                .parentId(comment.getParentId())
                .content(comment.isDeleted() ? "삭제된 댓글입니다." : comment.getContent())
                .deleted(comment.isDeleted())
                .replyCount(replyCount)
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }
}
