package com.scsa.issuetracker.chat;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    long countByProjectId(Long projectId);
}
