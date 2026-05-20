package com.scsa.issuetracker.comment.dto;

import lombok.*;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class CommentUpdateRequest {
    private String content;
}
