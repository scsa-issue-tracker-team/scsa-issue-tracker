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

        List<Comment> allComments = commentRepository.findByIssueIdOrderByCreatedAtAsc(issue.getId());
        long total = allComments.size();

        List<CommentResponse> items = allComments.stream()
                .skip(offset)
                .limit(limit)
                .map(CommentResponse::from)
                .toList();

        return CommentPageResponse.of(items, total);
    }

    private Issue getIssueInProject(Long projectId, Long issueId) {
        return issueRepository.findByIdAndProjectId(issueId, projectId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ISSUE_NOT_FOUND));
    }
}
