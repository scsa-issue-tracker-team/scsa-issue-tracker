package com.scsa.issuetracker.issue.controller;

import com.scsa.issuetracker.issue.domain.IssuePriority;
import com.scsa.issuetracker.issue.domain.IssueStatus;
import com.scsa.issuetracker.issue.domain.IssueType;
import com.scsa.issuetracker.issue.dto.IssueCreateRequest;
import com.scsa.issuetracker.issue.dto.IssueResponse;
import com.scsa.issuetracker.issue.dto.IssueStatusUpdateRequest;
import com.scsa.issuetracker.issue.dto.IssueUpdateRequest;
import com.scsa.issuetracker.issue.service.IssueService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Issue", description = "Issue API")
@RestController
@RequestMapping("/api/v1/projects/{projectId}/issues")
@RequiredArgsConstructor
public class IssueController {

    private final IssueService issueService;

    @Operation(summary = "Issue list")
    @GetMapping
    public ResponseEntity<Page<IssueResponse>> getIssues(
            @PathVariable Long projectId,
            @RequestParam(required = false) IssueStatus status,
            @RequestParam(required = false) IssueType issueType,
            @RequestParam(required = false) IssuePriority priority,
            @RequestParam(required = false) Long assigneeId,
            @RequestParam(required = false) Long reporterId,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate dueDateFrom,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate dueDateTo,
            @RequestParam(required = false) String keyword,
            Pageable pageable
    ) {
        return ResponseEntity.ok(issueService.getIssues(
                projectId,
                status,
                issueType,
                priority,
                assigneeId,
                reporterId,
                dueDateFrom,
                dueDateTo,
                keyword,
                pageable
        ));
    }

    @Operation(summary = "Create issue")
    @PostMapping
    public ResponseEntity<IssueResponse> createIssue(
            @PathVariable Long projectId,
            @Valid @RequestBody IssueCreateRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(issueService.createIssue(projectId, request));
    }

    @Operation(summary = "Get issue")
    @GetMapping("/{issueId}")
    public ResponseEntity<IssueResponse> getIssue(
            @PathVariable Long projectId,
            @PathVariable Long issueId
    ) {
        return ResponseEntity.ok(issueService.getIssue(projectId, issueId));
    }

    @Operation(summary = "Update issue")
    @PatchMapping("/{issueId}")
    public ResponseEntity<IssueResponse> updateIssue(
            @PathVariable Long projectId,
            @PathVariable Long issueId,
            @Valid @RequestBody IssueUpdateRequest request
    ) {
        return ResponseEntity.ok(issueService.updateIssue(projectId, issueId, request));
    }

    @Operation(summary = "Update issue status")
    @PatchMapping("/{issueId}/status")
    public ResponseEntity<IssueResponse> updateIssueStatus(
            @PathVariable Long projectId,
            @PathVariable Long issueId,
            @Valid @RequestBody IssueStatusUpdateRequest request
    ) {
        return ResponseEntity.ok(issueService.updateIssueStatus(projectId, issueId, request));
    }

    @Operation(summary = "Delete issue")
    @DeleteMapping("/{issueId}")
    public ResponseEntity<Void> deleteIssue(
            @PathVariable Long projectId,
            @PathVariable Long issueId
    ) {
        issueService.deleteIssue(projectId, issueId);
        return ResponseEntity.noContent().build();
    }
}
