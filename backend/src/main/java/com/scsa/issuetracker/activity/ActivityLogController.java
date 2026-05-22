package com.scsa.issuetracker.activity;

import com.scsa.issuetracker.activity.dto.ActivityLogResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/projects/{projectId}/issues/{issueId}/activities")
public class ActivityLogController {

    private final ActivityLogService activityLogService;

    @GetMapping
    public List<ActivityLogResponse> getIssueActivities(
            @PathVariable Long projectId,
            @PathVariable Long issueId
    ) {
        return activityLogService.getIssueActivities(projectId, issueId);
    }
}
