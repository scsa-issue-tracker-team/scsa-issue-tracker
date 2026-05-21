package com.scsa.issuetracker.comment.domain;

import com.scsa.issuetracker.common.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "comments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Comment extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "comments_seq")
    @SequenceGenerator(name = "comments_seq", sequenceName = "comments_seq", allocationSize = 1)
    private Long id;

    @Column(nullable = false)
    private Long authorId;

    @Column(nullable = false)
    private Long issueId;

    @Column(columnDefinition = "CLOB", nullable = false)
    private String content;
}