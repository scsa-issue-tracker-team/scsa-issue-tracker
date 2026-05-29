package com.scsa.issuetracker.chat;

import com.scsa.issuetracker.chat.dto.ChatMessagePageResponse;
import com.scsa.issuetracker.chat.dto.ChatMessageRequest;
import com.scsa.issuetracker.chat.dto.ChatMessageResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Validated
@RequestMapping("/api/v1/projects/{projectId}/chat/messages")
public class ChatController {

    private final ChatService chatService;

    @GetMapping
    public ResponseEntity<ChatMessagePageResponse> getMessages(
            @PathVariable Long projectId,
            @RequestParam(defaultValue = "50") @Min(1) @Max(100) int limit,
            @RequestParam(defaultValue = "0") @Min(0) int offset
    ) {
        return ResponseEntity.ok(chatService.getMessages(projectId, limit, offset));
    }

    @PostMapping
    public ResponseEntity<ChatMessageResponse> createMessage(
            @PathVariable Long projectId,
            @Valid @RequestBody ChatMessageRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(chatService.createMessage(projectId, request));
    }
}
