package com.scsa.issuetracker.comment.repository;

import com.scsa.issuetracker.comment.domain.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByIssueIdOrderByCreatedAtAsc(Long issueId);
}