package com.scsa.issuetracker.comment.service;

import com.scsa.issuetracker.comment.domain.Comment;
import com.scsa.issuetracker.comment.dto2.CommentCreateRequest;
import com.scsa.issuetracker.comment.dto2.CommentPageResponse;
import com.scsa.issuetracker.comment.dto2.CommentResponse;
import com.scsa.issuetracker.comment.repository.CommentRepository;
import com.scsa.issuetracker.common.exception.IssueNotFoundException;
import com.scsa.issuetracker.issue.repository.IssueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final IssueRepository issueRepository;

    @Override
    @Transactional
    public CommentResponse create(Long projectId, Long issueId, CommentCreateRequest request) {
        issueRepository.findById(issueId)
                .orElseThrow(() -> new IssueNotFoundException(issueId));

        Comment comment = Comment.builder()
                .issueId(issueId)
                .authorId(request.getAuthorId())
                .content(request.getContent())
                .build();

        return CommentResponse.from(commentRepository.save(comment));
    }

    @Override
    public CommentPageResponse getList(Long projectId, Long issueId, int limit, int offset) {
        issueRepository.findById(issueId)
                .orElseThrow(() -> new IssueNotFoundException(issueId));

        Pageable pageable = PageRequest.of(offset / limit, limit, Sort.by("createdAt").ascending());
        Page<Comment> page = commentRepository.findByIssueId(issueId, pageable);

        List<CommentResponse> items = page.getContent().stream()
                .map(CommentResponse::from)
                .toList();

        return CommentPageResponse.of(items, page.getTotalElements());
    }
}