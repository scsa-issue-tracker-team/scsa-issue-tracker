package com.scsa.issuetracker.comment.controller;

import com.scsa.issuetracker.comment.dto2.CommentCreateRequest;
import com.scsa.issuetracker.comment.dto2.CommentPageResponse;
import com.scsa.issuetracker.comment.dto2.CommentResponse;
import com.scsa.issuetracker.comment.service.CommentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Comment", description = "이슈 댓글 API")
@RestController
@RequestMapping("/api/v1/projects/{projectId}/issues/{issueId}/comments")
@RequiredArgsConstructor
@Validated
public class CommentController {

    private final CommentService commentService;

    @Operation(summary = "댓글 작성", description = "이슈에 댓글을 작성합니다.")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CommentResponse create(
            @PathVariable Long projectId,
            @PathVariable Long issueId,
            @Valid @RequestBody CommentCreateRequest request
    ) {
        return commentService.create(projectId, issueId, request);
    }

    @Operation(summary = "댓글 목록 조회", description = "이슈의 댓글 목록을 조회합니다.")
    @GetMapping
    public CommentPageResponse getList(
            @PathVariable Long projectId,
            @PathVariable Long issueId,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int limit,
            @RequestParam(defaultValue = "0") @Min(0) int offset
    ) {
        return commentService.getList(projectId, issueId, limit, offset);
    }
}