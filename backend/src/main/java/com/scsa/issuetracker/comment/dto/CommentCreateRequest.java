package com.scsa.issuetracker.comment.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class CommentCreateRequest {
    private Long authorId;
    private String content;
}
