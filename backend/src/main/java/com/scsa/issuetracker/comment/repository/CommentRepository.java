package com.scsa.issuetracker.comment.repository;

import com.scsa.issuetracker.comment.domain.Comment;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    long countByIssueIdAndParentIdIsNull(Long issueId);

    long countByIssueIdAndParentId(Long issueId, Long parentId);

    Optional<Comment> findByIdAndIssueId(Long id, Long issueId);

    Optional<Comment> findByIdAndIssueIdAndParentId(Long id, Long issueId, Long parentId);
}
