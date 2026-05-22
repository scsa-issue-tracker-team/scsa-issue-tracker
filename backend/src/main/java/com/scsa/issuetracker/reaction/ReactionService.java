package com.scsa.issuetracker.reaction;

import com.scsa.issuetracker.comment.repository.CommentRepository;
import com.scsa.issuetracker.global.exception.BusinessException;
import com.scsa.issuetracker.global.exception.ErrorCode;
import com.scsa.issuetracker.global.security.SecurityUtil;
import com.scsa.issuetracker.issue.repository.IssueRepository;
import com.scsa.issuetracker.projectmember.ProjectAccessValidator;
import com.scsa.issuetracker.reaction.dto.ReactionCountResponse;
import com.scsa.issuetracker.reaction.dto.ReactionRequest;
import com.scsa.issuetracker.reaction.dto.ReactionSummaryResponse;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReactionService {

    private final ReactionRepository reactionRepository;
    private final IssueRepository issueRepository;
    private final CommentRepository commentRepository;
    private final ProjectAccessValidator projectAccessValidator;

    @Transactional
    public ReactionSummaryResponse addIssueReaction(
            Long projectId,
            Long issueId,
            ReactionRequest request
    ) {
        validateIssue(projectId, issueId);
        addReaction(ReactionTargetType.ISSUE, issueId, request.reactionType());

        return getIssueReactions(projectId, issueId);
    }

    @Transactional
    public ReactionSummaryResponse removeIssueReaction(
            Long projectId,
            Long issueId,
            ReactionType reactionType
    ) {
        validateIssue(projectId, issueId);
        removeReaction(ReactionTargetType.ISSUE, issueId, reactionType);

        return getIssueReactions(projectId, issueId);
    }

    public ReactionSummaryResponse getIssueReactions(Long projectId, Long issueId) {
        validateIssue(projectId, issueId);

        return summarize(ReactionTargetType.ISSUE, issueId);
    }

    @Transactional
    public ReactionSummaryResponse addCommentReaction(
            Long projectId,
            Long issueId,
            Long commentId,
            ReactionRequest request
    ) {
        validateComment(projectId, issueId, commentId);
        addReaction(ReactionTargetType.COMMENT, commentId, request.reactionType());

        return getCommentReactions(projectId, issueId, commentId);
    }

    @Transactional
    public ReactionSummaryResponse removeCommentReaction(
            Long projectId,
            Long issueId,
            Long commentId,
            ReactionType reactionType
    ) {
        validateComment(projectId, issueId, commentId);
        removeReaction(ReactionTargetType.COMMENT, commentId, reactionType);

        return getCommentReactions(projectId, issueId, commentId);
    }

    public ReactionSummaryResponse getCommentReactions(Long projectId, Long issueId, Long commentId) {
        validateComment(projectId, issueId, commentId);

        return summarize(ReactionTargetType.COMMENT, commentId);
    }

    private void addReaction(ReactionTargetType targetType, Long targetId, ReactionType reactionType) {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        boolean alreadyReacted = reactionRepository
                .findByTargetTypeAndTargetIdAndUserIdAndReactionType(
                        targetType,
                        targetId,
                        currentUserId,
                        reactionType
                )
                .isPresent();

        if (!alreadyReacted) {
            reactionRepository.save(Reaction.of(targetType, targetId, currentUserId, reactionType));
        }
    }

    private void removeReaction(ReactionTargetType targetType, Long targetId, ReactionType reactionType) {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        reactionRepository.findByTargetTypeAndTargetIdAndUserIdAndReactionType(
                targetType,
                targetId,
                currentUserId,
                reactionType
        ).ifPresent(reactionRepository::delete);
    }

    private ReactionSummaryResponse summarize(ReactionTargetType targetType, Long targetId) {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        List<Reaction> reactions = reactionRepository.findByTargetTypeAndTargetId(targetType, targetId);

        Map<ReactionType, Long> counts = reactions.stream()
                .collect(Collectors.groupingBy(Reaction::getReactionType, Collectors.counting()));
        Set<ReactionType> myReactions = reactions.stream()
                .filter(reaction -> reaction.getUserId().equals(currentUserId))
                .map(Reaction::getReactionType)
                .collect(Collectors.toSet());

        List<ReactionCountResponse> response = Arrays.stream(ReactionType.values())
                .map(reactionType -> new ReactionCountResponse(
                        reactionType,
                        counts.getOrDefault(reactionType, 0L),
                        myReactions.contains(reactionType)
                ))
                .toList();

        return new ReactionSummaryResponse(response);
    }

    private void validateIssue(Long projectId, Long issueId) {
        projectAccessValidator.getAccessibleProject(projectId);
        issueRepository.findByIdAndProjectId(issueId, projectId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ISSUE_NOT_FOUND));
    }

    private void validateComment(Long projectId, Long issueId, Long commentId) {
        validateIssue(projectId, issueId);
        commentRepository.findByIdAndIssueId(commentId, issueId)
                .orElseThrow(() -> new BusinessException(ErrorCode.COMMENT_NOT_FOUND));
    }
}
