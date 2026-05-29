package com.scsa.issuetracker.chat;

import com.scsa.issuetracker.global.entity.BaseTimeEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "chat_messages")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ChatMessage extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "chat_messages_seq_gen")
    @SequenceGenerator(name = "chat_messages_seq_gen", sequenceName = "chat_messages_seq", allocationSize = 1)
    private Long id;

    @Column(nullable = false)
    private Long projectId;

    @Column(nullable = false)
    private Long senderId;

    @Column(nullable = false, columnDefinition = "CLOB")
    private String content;

    private ChatMessage(Long projectId, Long senderId, String content) {
        this.projectId = projectId;
        this.senderId = senderId;
        this.content = content;
    }

    public static ChatMessage of(Long projectId, Long senderId, String content) {
        return new ChatMessage(projectId, senderId, content);
    }
}
