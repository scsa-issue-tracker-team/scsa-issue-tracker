package com.scsa.issuetracker.issue.repository;

import com.scsa.issuetracker.issue.domain.Issue;
import com.scsa.issuetracker.issue.domain.IssuePriority;
import com.scsa.issuetracker.issue.domain.IssueStatus;
import com.scsa.issuetracker.issue.domain.IssueType;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IssueRepository extends JpaRepository<Issue, Long> {

    Page<Issue> findByProjectId(Long projectId, Pageable pageable);

    Page<Issue> findByProjectIdAndStatus(Long projectId, IssueStatus status, Pageable pageable);

    Page<Issue> findByProjectIdAndIssueType(Long projectId, IssueType issueType, Pageable pageable);

    Page<Issue> findByProjectIdAndPriority(Long projectId, IssuePriority priority, Pageable pageable);

    Page<Issue> findByProjectIdAndStatusAndIssueTypeAndPriority(
            Long projectId,
            IssueStatus status,
            IssueType issueType,
            IssuePriority priority,
            Pageable pageable
    );

    Optional<Issue> findByIdAndProjectId(Long issueId, Long projectId);
}
