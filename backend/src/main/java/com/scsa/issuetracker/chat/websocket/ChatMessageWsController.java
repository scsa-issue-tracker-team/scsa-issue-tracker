package com.scsa.issuetracker.chat.websocket;

import com.scsa.issuetracker.chat.ChatService;
import com.scsa.issuetracker.chat.dto.ChatMessageRequest;
import com.scsa.issuetracker.chat.dto.ChatMessageResponse;
import jakarta.validation.Valid;
import java.security.Principal;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.validation.annotation.Validated;

@Controller
@RequiredArgsConstructor
@Validated
public class ChatMessageWsController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/projects/{projectId}/chat.send")
    public void send(
            @DestinationVariable Long projectId,
            @Valid @Payload ChatMessageRequest request,
            Principal principal
    ) {
        Long senderId = Long.valueOf(principal.getName());
        ChatMessageResponse response = chatService.createMessage(projectId, senderId, request);
        messagingTemplate.convertAndSend("/topic/projects/" + projectId + "/chat", response);
    }
}
