package com.scsa.issuetracker.chat.websocket;

import com.scsa.issuetracker.chat.ChatService;
import com.scsa.issuetracker.global.security.JwtTokenProvider;
import java.security.Principal;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
@RequiredArgsConstructor
public class WebSocketAuthChannelInterceptor implements ChannelInterceptor {

    private static final String BEARER_PREFIX = "Bearer ";
    private static final Pattern PROJECT_CHAT_DESTINATION = Pattern.compile(
            "^/(?:app|topic)/projects/(\\d+)/chat(?:\\.send)?$"
    );

    private final JwtTokenProvider jwtTokenProvider;
    private final ChatService chatService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null) {
            return message;
        }
        StompCommand command = accessor.getCommand();

        if (command == StompCommand.CONNECT) {
            accessor.setUser(authenticate(accessor));
            return message;
        }

        if (command == StompCommand.SUBSCRIBE || command == StompCommand.SEND) {
            Long projectId = extractProjectId(accessor.getDestination());
            if (projectId != null) {
                Long userId = currentUserId(accessor.getUser());
                chatService.validateProjectMember(projectId, userId);
            }
        }

        return message;
    }

    private Principal authenticate(StompHeaderAccessor accessor) {
        String token = resolveToken(accessor);
        if (!StringUtils.hasText(token) || !jwtTokenProvider.validateToken(token)) {
            throw new AccessDeniedException("Invalid WebSocket token");
        }
        return new ChatPrincipal(jwtTokenProvider.getUserId(token));
    }

    private String resolveToken(StompHeaderAccessor accessor) {
        String authorization = accessor.getFirstNativeHeader("Authorization");
        if (StringUtils.hasText(authorization) && authorization.startsWith(BEARER_PREFIX)) {
            return authorization.substring(BEARER_PREFIX.length());
        }
        return accessor.getFirstNativeHeader("access_token");
    }

    private Long currentUserId(Principal principal) {
        if (principal instanceof ChatPrincipal chatPrincipal) {
            return chatPrincipal.userId();
        }
        if (principal != null && StringUtils.hasText(principal.getName())) {
            return Long.valueOf(principal.getName());
        }
        throw new AccessDeniedException("WebSocket connection is not authenticated");
    }

    private Long extractProjectId(String destination) {
        if (!StringUtils.hasText(destination)) {
            return null;
        }
        Matcher matcher = PROJECT_CHAT_DESTINATION.matcher(destination);
        if (!matcher.matches()) {
            return null;
        }
        return Long.valueOf(matcher.group(1));
    }
}
