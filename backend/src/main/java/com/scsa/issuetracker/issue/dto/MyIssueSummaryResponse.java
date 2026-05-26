package com.scsa.issuetracker.issue.dto;

import com.scsa.issuetracker.issue.domain.IssueStatus;
import java.util.Map;

public record MyIssueSummaryResponse(
        long totalRelatedCount,
        long assignedToMeCount,
        long reportedByMeCount,
        long overdueCount,
        long dueSoonCount,
        Map<IssueStatus, Long> statusCounts
) {
}
