package com.scsa.issuetracker.comment.repository;

import com.scsa.issuetracker.comment.domain.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentRepository extends JpaRepository<Comment, Long>{
    Page<Comment> findByIssueId(Long issueId, Pageable pageable);
}
