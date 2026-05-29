package com.scsa.issuetracker.chat.dto;

import com.scsa.issuetracker.chat.ChatMessage;
import java.time.LocalDateTime;

public record ChatMessageResponse(
        Long id,
        Long projectId,
        Long senderId,
        String senderUsername,
        String content,
        LocalDateTime createdAt
) {
    public static ChatMessageResponse from(ChatMessage message, String senderUsername) {
        return new ChatMessageResponse(
                message.getId(),
                message.getProjectId(),
                message.getSenderId(),
                senderUsername,
                message.getContent(),
                message.getCreatedAt()
        );
    }
}
