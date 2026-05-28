package com.scsa.issuetracker.issue.controller;

import com.scsa.issuetracker.issue.domain.IssueStatus;
import com.scsa.issuetracker.issue.domain.MyIssueRole;
import com.scsa.issuetracker.issue.dto.IssueResponse;
import com.scsa.issuetracker.issue.dto.MyIssueSummaryResponse;
import com.scsa.issuetracker.issue.service.IssueService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/issues")
@RequiredArgsConstructor
public class MyIssueController {

    private final IssueService issueService;

    @Operation(summary = "My issue list")
    @GetMapping("/my")
    public ResponseEntity<Page<IssueResponse>> getMyIssues(
            @RequestParam(required = false, defaultValue = "ALL") MyIssueRole role,
            @RequestParam(required = false) IssueStatus status,
            Pageable pageable
    ) {
        return ResponseEntity.ok(issueService.getMyIssues(role, status, pageable));
    }

    @Operation(summary = "My issue summary")
    @GetMapping("/my/summary")
    public ResponseEntity<MyIssueSummaryResponse> getMyIssueSummary() {
        return ResponseEntity.ok(issueService.getMyIssueSummary());
    }
}
