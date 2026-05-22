package com.scsa.issuetracker.reaction;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReactionRepository extends JpaRepository<Reaction, Long> {

    Optional<Reaction> findByTargetTypeAndTargetIdAndUserIdAndReactionType(
            ReactionTargetType targetType,
            Long targetId,
            Long userId,
            ReactionType reactionType
    );

    List<Reaction> findByTargetTypeAndTargetId(ReactionTargetType targetType, Long targetId);
}
