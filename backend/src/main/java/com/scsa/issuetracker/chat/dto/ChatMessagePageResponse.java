package com.scsa.issuetracker.chat.dto;

import java.util.List;

public record ChatMessagePageResponse(
        List<ChatMessageResponse> items,
        long total
) {
}
