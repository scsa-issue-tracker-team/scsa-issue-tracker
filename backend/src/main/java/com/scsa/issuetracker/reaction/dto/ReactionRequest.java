package com.scsa.issuetracker.reaction.dto;

import com.scsa.issuetracker.reaction.ReactionType;
import jakarta.validation.constraints.NotNull;

public record ReactionRequest(
        @NotNull(message = "반응 타입은 필수입니다.")
        ReactionType reactionType
) {
}
