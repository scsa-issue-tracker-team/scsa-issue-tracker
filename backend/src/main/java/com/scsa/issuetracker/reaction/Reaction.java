package com.scsa.issuetracker.reaction;

import com.scsa.issuetracker.global.entity.BaseTimeEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(
        name = "reactions",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "reactions_unique_target_user_type",
                        columnNames = {"target_type", "target_id", "user_id", "reaction_type"}
                )
        }
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Reaction extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "reactions_seq_gen")
    @SequenceGenerator(name = "reactions_seq_gen", sequenceName = "reactions_seq", allocationSize = 1)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_type", nullable = false, length = 20)
    private ReactionTargetType targetType;

    @Column(name = "target_id", nullable = false)
    private Long targetId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "reaction_type", nullable = false, length = 30)
    private ReactionType reactionType;

    private Reaction(
            ReactionTargetType targetType,
            Long targetId,
            Long userId,
            ReactionType reactionType
    ) {
        this.targetType = targetType;
        this.targetId = targetId;
        this.userId = userId;
        this.reactionType = reactionType;
    }

    public static Reaction of(
            ReactionTargetType targetType,
            Long targetId,
            Long userId,
            ReactionType reactionType
    ) {
        return new Reaction(targetType, targetId, userId, reactionType);
    }
}
