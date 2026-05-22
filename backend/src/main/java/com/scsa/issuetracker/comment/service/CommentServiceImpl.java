package com.scsa.issuetracker.comment.service;

import com.scsa.issuetracker.comment.domain.Comment;
import com.scsa.issuetracker.comment.dto.CommentCreateRequest;
import com.scsa.issuetracker.comment.dto.CommentPageResponse;
import com.scsa.issuetracker.comment.dto.CommentResponse;
import com.scsa.issuetracker.comment.repository.CommentRepository;
import com.scsa.issuetracker.global.exception.BusinessException;
import com.scsa.issuetracker.global.exception.ErrorCode;
import com.scsa.issuetracker.global.security.SecurityUtil;
import com.scsa.issuetracker.issue.domain.Issue;
import com.scsa.issuetracker.issue.repository.IssueRepository;
import com.scsa.issuetracker.projectmember.ProjectAccessValidator;
import jakarta.persistence.EntityManager;
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

    @Override
    @Transactional
    public CommentResponse create(Long projectId, Long issueId, CommentCreateRequest request) {
        Issue issue = getIssueInProject(projectId, issueId);
        Long currentUserId = SecurityUtil.getCurrentUserId();

        Comment comment = Comment.builder()
                .issueId(issue.getId())
                .authorId(currentUserId)
                .content(request.getContent())
                .build();

        return CommentResponse.from(commentRepository.save(comment));
    }

    @Override
    public CommentPageResponse getList(Long projectId, Long issueId, int limit, int offset) {
        Issue issue = getIssueInProject(projectId, issueId);

        List<Comment> comments = entityManager.createQuery(
                        """
                                select comment
                                from Comment comment
                                where comment.issueId = :issueId
                                order by comment.createdAt asc
                                """,
                        Comment.class
                )
                .setParameter("issueId", issue.getId())
                .setFirstResult(offset)
                .setMaxResults(limit)
                .getResultList();

        long total = commentRepository.countByIssueId(issue.getId());

        List<CommentResponse> items = comments.stream()
                .map(CommentResponse::from)
                .toList();

        return CommentPageResponse.of(items, total);
    }

    private Issue getIssueInProject(Long projectId, Long issueId) {
        projectAccessValidator.getAccessibleProject(projectId);

        return issueRepository.findByIdAndProjectId(issueId, projectId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ISSUE_NOT_FOUND));
    }
}
