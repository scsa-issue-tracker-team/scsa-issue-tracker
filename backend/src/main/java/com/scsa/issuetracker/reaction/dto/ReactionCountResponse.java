package com.scsa.issuetracker.reaction.dto;

import com.scsa.issuetracker.reaction.ReactionType;

public record ReactionCountResponse(
        ReactionType reactionType,
        long count,
        boolean reactedByMe
) {
}
