package com.scsa.issuetracker.chat;

import com.scsa.issuetracker.chat.dto.ChatMessagePageResponse;
import com.scsa.issuetracker.chat.dto.ChatMessageRequest;
import com.scsa.issuetracker.chat.dto.ChatMessageResponse;
import com.scsa.issuetracker.global.exception.BusinessException;
import com.scsa.issuetracker.global.exception.ErrorCode;
import com.scsa.issuetracker.global.security.SecurityUtil;
import com.scsa.issuetracker.project.entity.Project;
import com.scsa.issuetracker.project.repository.ProjectRepository;
import com.scsa.issuetracker.projectmember.ProjectAccessValidator;
import com.scsa.issuetracker.projectmember.ProjectMemberRepository;
import com.scsa.issuetracker.user.entity.User;
import com.scsa.issuetracker.user.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final ProjectRepository projectRepository;
    private final ProjectAccessValidator projectAccessValidator;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;
    private final EntityManager entityManager;

    @Transactional(readOnly = true)
    public ChatMessagePageResponse getMessages(Long projectId, int limit, int offset) {
        projectAccessValidator.getAccessibleProject(projectId);

        TypedQuery<ChatMessage> query = entityManager.createQuery("""
                select message
                from ChatMessage message
                where message.projectId = :projectId
                order by message.createdAt desc, message.id desc
                """, ChatMessage.class);
        query.setParameter("projectId", projectId);
        query.setFirstResult(offset);
        query.setMaxResults(limit);

        List<ChatMessage> messages = query.getResultList();
        long total = chatMessageRepository.countByProjectId(projectId);
        Map<Long, User> users = loadUsers(messages);

        List<ChatMessageResponse> items = messages.stream()
                .map(message -> toResponse(message, users))
                .toList();

        return new ChatMessagePageResponse(items, total);
    }

    @Transactional
    public ChatMessageResponse createMessage(Long projectId, ChatMessageRequest request) {
        Long senderId = SecurityUtil.getCurrentUserId();
        return createMessage(projectId, senderId, request);
    }

    @Transactional
    public ChatMessageResponse createMessage(Long projectId, Long senderId, ChatMessageRequest request) {
        validateProjectMember(projectId, senderId);

        ChatMessage saved = chatMessageRepository.save(
                ChatMessage.of(projectId, senderId, request.content().trim())
        );
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        return ChatMessageResponse.from(saved, sender.getUsername());
    }

    @Transactional(readOnly = true)
    public void validateProjectMember(Long projectId, Long userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PROJECT_NOT_FOUND));

        if (!project.getCreatedById().getId().equals(userId)
                && !projectMemberRepository.existsByProject_IdAndUser_Id(projectId, userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
    }

    private Map<Long, User> loadUsers(List<ChatMessage> messages) {
        List<Long> senderIds = messages.stream()
                .map(ChatMessage::getSenderId)
                .distinct()
                .toList();

        return userRepository.findAllById(senderIds).stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));
    }

    private ChatMessageResponse toResponse(ChatMessage message, Map<Long, User> users) {
        User sender = users.get(message.getSenderId());
        String username = sender == null ? "unknown" : sender.getUsername();
        return ChatMessageResponse.from(message, username);
    }
}
