package com.scsa.issuetracker.comment.dto;

import com.scsa.issuetracker.comment.domain.Comment;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class CommentResponse {
    private Long id;
    private  Long authorId;
    private Long issueId;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static CommentResponse from(Comment comment) {
        return CommentResponse.builder()
                .id(comment.getId())
                .authorId(comment.getAuthorId())
                .issueId(comment.getIssueId())
                .content(comment.getContent())
//                .createdAt(comment.getCreatedAt())
//                .updatedAt(comment.getUpdatedAt())
                .build();
    }
}
