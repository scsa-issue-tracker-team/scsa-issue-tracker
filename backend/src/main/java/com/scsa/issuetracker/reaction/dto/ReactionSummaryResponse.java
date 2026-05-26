package com.scsa.issuetracker.reaction.dto;

import java.util.List;

public record ReactionSummaryResponse(
        List<ReactionCountResponse> reactions
) {
}
