package com.scsa.issuetracker.comment.service;

import com.scsa.issuetracker.activity.ActivityLogService;
import com.scsa.issuetracker.activity.ActivityType;
import com.scsa.issuetracker.comment.domain.Comment;
import com.scsa.issuetracker.comment.dto.CommentCreateRequest;
import com.scsa.issuetracker.comment.dto.CommentPageResponse;
import com.scsa.issuetracker.comment.dto.CommentResponse;
import com.scsa.issuetracker.comment.dto.CommentUpdateRequest;
import com.scsa.issuetracker.comment.repository.CommentRepository;
import com.scsa.issuetracker.global.exception.BusinessException;
import com.scsa.issuetracker.global.exception.ErrorCode;
import com.scsa.issuetracker.global.security.SecurityUtil;
import com.scsa.issuetracker.issue.domain.Issue;
import com.scsa.issuetracker.issue.repository.IssueRepository;
import com.scsa.issuetracker.notification.NotificationService;
import com.scsa.issuetracker.projectmember.ProjectAccessValidator;
import jakarta.persistence.EntityManager;
import java.util.Arrays;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final IssueRepository issueRepository;
    private final ProjectAccessValidator projectAccessValidator;
    private final EntityManager entityManager;
    private final ActivityLogService activityLogService;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public CommentResponse create(Long projectId, Long issueId, CommentCreateRequest request) {
        Issue issue = getIssueInProject(projectId, issueId);
        Long currentUserId = SecurityUtil.getCurrentUserId();

        Comment comment = Comment.builder()
                .issueId(issue.getId())
                .authorId(currentUserId)
                .parentId(null)
                .content(request.getContent())
                .build();

        Comment savedComment = commentRepository.save(comment);
        activityLogService.record(
                projectId,
                issue.getId(),
                currentUserId,
                ActivityType.COMMENT_CREATED,
                "댓글이 작성되었습니다."
        );
        notificationService.notifyCommentCreated(
                projectId,
                issue.getId(),
                savedComment.getId(),
                currentUserId,
                Arrays.asList(issue.getReporterId(), issue.getAssigneeId())
        );

        return CommentResponse.from(savedComment);
    }

    @Override
    public CommentPageResponse getList(Long projectId, Long issueId, int limit, int offset) {
        Issue issue = getIssueInProject(projectId, issueId);

        List<Comment> comments = entityManager.createQuery(
                        """
                                select comment
                                from Comment comment
                                where comment.issueId = :issueId
                                  and comment.parentId is null
                                order by comment.createdAt asc
                                """,
                        Comment.class
                )
                .setParameter("issueId", issue.getId())
                .setFirstResult(offset)
                .setMaxResults(limit)
                .getResultList();

        long total = commentRepository.countByIssueIdAndParentIdIsNull(issue.getId());

        List<CommentResponse> items = comments.stream()
                .map(comment -> CommentResponse.from(
                        comment,
                        commentRepository.countByIssueIdAndParentId(issue.getId(), comment.getId())
                ))
                .toList();

        return CommentPageResponse.of(items, total);
    }

    @Override
    @Transactional
    public CommentResponse update(
            Long projectId,
            Long issueId,
            Long commentId,
            CommentUpdateRequest request
    ) {
        Issue issue = getIssueInProject(projectId, issueId);
        Comment comment = getRootComment(issue.getId(), commentId);
        validateAuthor(comment);
        validateNotDeleted(comment);

        comment.updateContent(request.getContent());
        activityLogService.record(
                projectId,
                issue.getId(),
                SecurityUtil.getCurrentUserId(),
                ActivityType.COMMENT_UPDATED,
                "댓글이 수정되었습니다."
        );

        return CommentResponse.from(
                comment,
                commentRepository.countByIssueIdAndParentId(issue.getId(), comment.getId())
        );
    }

    @Override
    @Transactional
    public void delete(Long projectId, Long issueId, Long commentId) {
        Issue issue = getIssueInProject(projectId, issueId);
        Comment comment = getRootComment(issue.getId(), commentId);
        validateAuthor(comment);
        validateNotDeleted(comment);

        comment.delete();
        activityLogService.record(
                projectId,
                issue.getId(),
                SecurityUtil.getCurrentUserId(),
                ActivityType.COMMENT_DELETED,
                "댓글이 삭제되었습니다."
        );
    }

    @Override
    @Transactional
    public CommentResponse createReply(
            Long projectId,
            Long issueId,
            Long commentId,
            CommentCreateRequest request
    ) {
        Issue issue = getIssueInProject(projectId, issueId);
        Comment parentComment = getRootComment(issue.getId(), commentId);
        validateNotDeleted(parentComment);
        Long currentUserId = SecurityUtil.getCurrentUserId();

        Comment reply = Comment.builder()
                .issueId(issue.getId())
                .authorId(currentUserId)
                .parentId(parentComment.getId())
                .content(request.getContent())
                .build();

        Comment savedReply = commentRepository.save(reply);
        activityLogService.record(
                projectId,
                issue.getId(),
                currentUserId,
                ActivityType.COMMENT_CREATED,
                "대댓글이 작성되었습니다."
        );
        notificationService.notifyReplyCreated(
                projectId,
                issue.getId(),
                savedReply.getId(),
                currentUserId,
                parentComment.getAuthorId()
        );

        return CommentResponse.from(savedReply);
    }

    @Override
    public CommentPageResponse getReplies(
            Long projectId,
            Long issueId,
            Long commentId,
            int limit,
            int offset
    ) {
        Issue issue = getIssueInProject(projectId, issueId);
        Comment parentComment = getRootComment(issue.getId(), commentId);

        List<Comment> replies = entityManager.createQuery(
                        """
                                select comment
                                from Comment comment
                                where comment.issueId = :issueId
                                  and comment.parentId = :parentId
                                order by comment.createdAt asc
                                """,
                        Comment.class
                )
                .setParameter("issueId", issue.getId())
                .setParameter("parentId", parentComment.getId())
                .setFirstResult(offset)
                .setMaxResults(limit)
                .getResultList();

        long total = commentRepository.countByIssueIdAndParentId(issue.getId(), parentComment.getId());

        List<CommentResponse> items = replies.stream()
                .map(CommentResponse::from)
                .toList();

        return CommentPageResponse.of(items, total);
    }

    @Override
    @Transactional
    public CommentResponse updateReply(
            Long projectId,
            Long issueId,
            Long commentId,
            Long replyId,
            CommentUpdateRequest request
    ) {
        Issue issue = getIssueInProject(projectId, issueId);
        Comment reply = getReply(issue.getId(), commentId, replyId);
        validateAuthor(reply);
        validateNotDeleted(reply);

        reply.updateContent(request.getContent());
        activityLogService.record(
                projectId,
                issue.getId(),
                SecurityUtil.getCurrentUserId(),
                ActivityType.COMMENT_UPDATED,
                "대댓글이 수정되었습니다."
        );

        return CommentResponse.from(reply);
    }

    @Override
    @Transactional
    public void deleteReply(Long projectId, Long issueId, Long commentId, Long replyId) {
        Issue issue = getIssueInProject(projectId, issueId);
        Comment reply = getReply(issue.getId(), commentId, replyId);
        validateAuthor(reply);
        validateNotDeleted(reply);

        reply.delete();
        activityLogService.record(
                projectId,
                issue.getId(),
                SecurityUtil.getCurrentUserId(),
                ActivityType.COMMENT_DELETED,
                "대댓글이 삭제되었습니다."
        );
    }

    private Issue getIssueInProject(Long projectId, Long issueId) {
        projectAccessValidator.getAccessibleProject(projectId);

        return issueRepository.findByIdAndProjectId(issueId, projectId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ISSUE_NOT_FOUND));
    }

    private Comment getRootComment(Long issueId, Long commentId) {
        Comment comment = commentRepository.findByIdAndIssueId(commentId, issueId)
                .orElseThrow(() -> new BusinessException(ErrorCode.COMMENT_NOT_FOUND));

        if (comment.getParentId() != null) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "대댓글에는 다시 답글을 달 수 없습니다.");
        }

        return comment;
    }

    private Comment getReply(Long issueId, Long parentId, Long replyId) {
        getRootComment(issueId, parentId);

        return commentRepository.findByIdAndIssueIdAndParentId(replyId, issueId, parentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.COMMENT_NOT_FOUND));
    }

    private void validateAuthor(Comment comment) {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        if (!comment.getAuthorId().equals(currentUserId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
    }

    private void validateNotDeleted(Comment comment) {
        if (comment.isDeleted()) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "이미 삭제된 댓글입니다.");
        }
    }
}
