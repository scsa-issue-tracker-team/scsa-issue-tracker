package com.scsa.issuetracker.comment.dto2;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class CommentPageResponse {

    private List<CommentResponse> items;
    private long total;

    public static CommentPageResponse of(List<CommentResponse> items, long total) {
        return CommentPageResponse.builder()
                .items(items)
                .total(total)
                .build();
    }
}