package com.scsa.issuetracker.issue.controller;


import com.scsa.issuetracker.issue.domain.IssuePriority;
import com.scsa.issuetracker.issue.domain.IssueStatus;
import com.scsa.issuetracker.issue.domain.IssueType;
import com.scsa.issuetracker.issue.dto.IssueCreateRequest;
import com.scsa.issuetracker.issue.dto.IssueResponse;
import com.scsa.issuetracker.issue.dto.IssueUpdateRequest;
import com.scsa.issuetracker.issue.service.IssueService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Issue", description = "이슈 API")
@RestController
@RequestMapping("/api/v1/projects/{projectId}/issues")
@RequiredArgsConstructor

public class IssueController {
    private final IssueService issueService;

    @Operation(summary = "이슈 생성")
    @PostMapping
    public ResponseEntity<IssueResponse> createIssue(
            @PathVariable Long projectId,
            @Valid @RequestBody IssueCreateRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(issueService.createIssue(projectId, request));
    }

    @Operation(summary = "이슈 단건 조회")
    @GetMapping("/{issueId}")
    public ResponseEntity<IssueResponse> getIssue(@PathVariable Long issueId) {
        return ResponseEntity.ok(issueService.getIssue(issueId));
    }

    @Operation(summary = "이슈 수정")
    @PatchMapping("/{issueId}")
    public ResponseEntity<IssueResponse> updateIssue(
            @PathVariable Long issueId,
            @Valid @RequestBody IssueUpdateRequest request
    ) {
        return ResponseEntity.ok(issueService.updateIssue(issueId, request));
    }

    @Operation(summary = "이슈 삭제")
    @DeleteMapping("/{issueId}")
    public ResponseEntity<Void> deleteIssue(@PathVariable Long issueId) {
        issueService.deleteIssue(issueId);
        return ResponseEntity.noContent().build();
    }
}
