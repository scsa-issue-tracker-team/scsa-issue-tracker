package com.scsa.issuetracker.issue.repository;

import com.scsa.issuetracker.issue.domain.Issue;
import com.scsa.issuetracker.issue.domain.IssuePriority;
import com.scsa.issuetracker.issue.domain.IssueStatus;
import com.scsa.issuetracker.issue.domain.IssueType;
import java.time.LocalDate;
import java.util.Collection;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface IssueRepository extends JpaRepository<Issue, Long>, JpaSpecificationExecutor<Issue> {

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

    @Query("""
            select issue
            from Issue issue
            where issue.projectId = :projectId
              and (:status is null or issue.status = :status)
              and (:issueType is null or issue.issueType = :issueType)
              and (:priority is null or issue.priority = :priority)
              and (:assigneeId is null or issue.assigneeId = :assigneeId)
              and (:reporterId is null or issue.reporterId = :reporterId)
              and (:dueDateFrom is null or issue.dueDate >= :dueDateFrom)
              and (:dueDateTo is null or issue.dueDate <= :dueDateTo)
              and (
                    :keyword is null
                    or lower(issue.title) like lower(concat('%', concat(:keyword, '%')))
              )
            """)
    Page<Issue> findByProjectIdWithFilters(
            @Param("projectId") Long projectId,
            @Param("status") IssueStatus status,
            @Param("issueType") IssueType issueType,
            @Param("priority") IssuePriority priority,
            @Param("assigneeId") Long assigneeId,
            @Param("reporterId") Long reporterId,
            @Param("dueDateFrom") LocalDate dueDateFrom,
            @Param("dueDateTo") LocalDate dueDateTo,
            @Param("keyword") String keyword,
            Pageable pageable
    );

    Optional<Issue> findByIdAndProjectId(Long issueId, Long projectId);

    @Query("""
            select issue
            from Issue issue
            where issue.assigneeId = :userId
              and (:status is null or issue.status = :status)
            """)
    Page<Issue> findAssignedToUser(
            @Param("userId") Long userId,
            @Param("status") IssueStatus status,
            Pageable pageable
    );

    @Query("""
            select issue
            from Issue issue
            where issue.reporterId = :userId
              and (:status is null or issue.status = :status)
            """)
    Page<Issue> findReportedByUser(
            @Param("userId") Long userId,
            @Param("status") IssueStatus status,
            Pageable pageable
    );

    @Query("""
            select issue
            from Issue issue
            where (issue.assigneeId = :userId or issue.reporterId = :userId)
              and (:status is null or issue.status = :status)
            """)
    Page<Issue> findRelatedToUser(
            @Param("userId") Long userId,
            @Param("status") IssueStatus status,
            Pageable pageable
    );

    @Query("""
            select count(issue)
            from Issue issue
            where issue.assigneeId = :userId
               or issue.reporterId = :userId
            """)
    long countRelatedToUser(@Param("userId") Long userId);

    long countByAssigneeId(Long assigneeId);

    long countByReporterId(Long reporterId);

    @Query("""
            select count(issue)
            from Issue issue
            where (issue.assigneeId = :userId or issue.reporterId = :userId)
              and issue.status = :status
            """)
    long countRelatedToUserByStatus(
            @Param("userId") Long userId,
            @Param("status") IssueStatus status
    );

    @Query("""
            select count(issue)
            from Issue issue
            where (issue.assigneeId = :userId or issue.reporterId = :userId)
              and issue.dueDate < :today
              and issue.status not in :closedStatuses
            """)
    long countOverdueRelatedToUser(
            @Param("userId") Long userId,
            @Param("today") LocalDate today,
            @Param("closedStatuses") Collection<IssueStatus> closedStatuses
    );

    @Query("""
            select count(issue)
            from Issue issue
            where (issue.assigneeId = :userId or issue.reporterId = :userId)
              and issue.dueDate between :today and :dueDateTo
              and issue.status not in :closedStatuses
            """)
    long countDueSoonRelatedToUser(
            @Param("userId") Long userId,
            @Param("today") LocalDate today,
            @Param("dueDateTo") LocalDate dueDateTo,
            @Param("closedStatuses") Collection<IssueStatus> closedStatuses
    );
}
