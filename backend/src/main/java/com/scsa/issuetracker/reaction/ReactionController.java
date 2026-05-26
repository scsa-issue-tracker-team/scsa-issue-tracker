package com.scsa.issuetracker.reaction;

import com.scsa.issuetracker.reaction.dto.ReactionRequest;
import com.scsa.issuetracker.reaction.dto.ReactionSummaryResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/projects/{projectId}/issues/{issueId}")
public class ReactionController {

    private final ReactionService reactionService;

    @GetMapping("/reactions")
    public ReactionSummaryResponse getIssueReactions(
            @PathVariable Long projectId,
            @PathVariable Long issueId
    ) {
        return reactionService.getIssueReactions(projectId, issueId);
    }

    @PostMapping("/reactions")
    public ReactionSummaryResponse addIssueReaction(
            @PathVariable Long projectId,
            @PathVariable Long issueId,
            @Valid @RequestBody ReactionRequest request
    ) {
        return reactionService.addIssueReaction(projectId, issueId, request);
    }

    @DeleteMapping("/reactions/{reactionType}")
    public ReactionSummaryResponse removeIssueReaction(
            @PathVariable Long projectId,
            @PathVariable Long issueId,
            @PathVariable ReactionType reactionType
    ) {
        return reactionService.removeIssueReaction(projectId, issueId, reactionType);
    }

    @GetMapping("/comments/{commentId}/reactions")
    public ReactionSummaryResponse getCommentReactions(
            @PathVariable Long projectId,
            @PathVariable Long issueId,
            @PathVariable Long commentId
    ) {
        return reactionService.getCommentReactions(projectId, issueId, commentId);
    }

    @PostMapping("/comments/{commentId}/reactions")
    public ReactionSummaryResponse addCommentReaction(
            @PathVariable Long projectId,
            @PathVariable Long issueId,
            @PathVariable Long commentId,
            @Valid @RequestBody ReactionRequest request
    ) {
        return reactionService.addCommentReaction(projectId, issueId, commentId, request);
    }

    @DeleteMapping("/comments/{commentId}/reactions/{reactionType}")
    public ReactionSummaryResponse removeCommentReaction(
            @PathVariable Long projectId,
            @PathVariable Long issueId,
            @PathVariable Long commentId,
            @PathVariable ReactionType reactionType
    ) {
        return reactionService.removeCommentReaction(projectId, issueId, commentId, reactionType);
    }
}
