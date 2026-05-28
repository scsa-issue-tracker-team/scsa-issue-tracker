package com.scsa.issuetracker.activity;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {

    List<ActivityLog> findByProjectIdAndIssueIdOrderByCreatedAtAsc(Long projectId, Long issueId);

    List<ActivityLog> findByActorIdAndCreatedAtGreaterThanEqualOrderByCreatedAtAsc(
            Long actorId,
            LocalDateTime from
    );
}
