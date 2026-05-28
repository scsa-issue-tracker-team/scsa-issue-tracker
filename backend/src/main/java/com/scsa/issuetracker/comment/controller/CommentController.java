package com.scsa.issuetracker.comment.controller;

import com.scsa.issuetracker.comment.dto.CommentCreateRequest;
import com.scsa.issuetracker.comment.dto.CommentPageResponse;
import com.scsa.issuetracker.comment.dto.CommentResponse;
import com.scsa.issuetracker.comment.dto.CommentUpdateRequest;
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
import org.springframework.http.ResponseEntity;

@Tag(name = "Comment", description = "이슈 댓글 API")
@RestController
@RequestMapping("/api/v1/projects/{projectId}/issues/{issueId}/comments")
@RequiredArgsConstructor
@Validated
public class CommentController {

    private final CommentService commentService;

    @Operation(summary = "댓글 작성", description = "이슈에 댓글을 작성합니다.")
    @PostMapping
    public ResponseEntity<CommentResponse> create(
            @PathVariable Long projectId,
            @PathVariable Long issueId,
            @Valid @RequestBody CommentCreateRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(commentService.create(projectId, issueId, request));
    }

    @Operation(summary = "댓글 목록 조회", description = "이슈의 댓글 목록을 조회합니다.")
    @GetMapping
    public ResponseEntity<CommentPageResponse> getList(
            @PathVariable Long projectId,
            @PathVariable Long issueId,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int limit,
            @RequestParam(defaultValue = "0") @Min(0) int offset
    ) {
        return ResponseEntity.ok(commentService.getList(projectId, issueId, limit, offset));
    }

    @Operation(summary = "댓글 수정", description = "내가 작성한 댓글을 수정합니다.")
    @PatchMapping("/{commentId}")
    public ResponseEntity<CommentResponse> update(
            @PathVariable Long projectId,
            @PathVariable Long issueId,
            @PathVariable Long commentId,
            @Valid @RequestBody CommentUpdateRequest request
    ) {
        return ResponseEntity.ok(commentService.update(projectId, issueId, commentId, request));
    }

    @Operation(summary = "댓글 삭제", description = "내가 작성한 댓글을 삭제 상태로 변경합니다.")
    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> delete(
            @PathVariable Long projectId,
            @PathVariable Long issueId,
            @PathVariable Long commentId
    ) {
        commentService.delete(projectId, issueId, commentId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "대댓글 작성", description = "댓글에 답글을 작성합니다.")
    @PostMapping("/{commentId}/replies")
    public ResponseEntity<CommentResponse> createReply(
            @PathVariable Long projectId,
            @PathVariable Long issueId,
            @PathVariable Long commentId,
            @Valid @RequestBody CommentCreateRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(commentService.createReply(projectId, issueId, commentId, request));
    }

    @Operation(summary = "대댓글 목록 조회", description = "댓글의 답글 목록을 조회합니다.")
    @GetMapping("/{commentId}/replies")
    public ResponseEntity<CommentPageResponse> getReplies(
            @PathVariable Long projectId,
            @PathVariable Long issueId,
            @PathVariable Long commentId,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int limit,
            @RequestParam(defaultValue = "0") @Min(0) int offset
    ) {
        return ResponseEntity.ok(commentService.getReplies(projectId, issueId, commentId, limit, offset));
    }

    @Operation(summary = "대댓글 수정", description = "내가 작성한 대댓글을 수정합니다.")
    @PatchMapping("/{commentId}/replies/{replyId}")
    public ResponseEntity<CommentResponse> updateReply(
            @PathVariable Long projectId,
            @PathVariable Long issueId,
            @PathVariable Long commentId,
            @PathVariable Long replyId,
            @Valid @RequestBody CommentUpdateRequest request
    ) {
        return ResponseEntity.ok(commentService.updateReply(projectId, issueId, commentId, replyId, request));
    }

    @Operation(summary = "대댓글 삭제", description = "내가 작성한 대댓글을 삭제 상태로 변경합니다.")
    @DeleteMapping("/{commentId}/replies/{replyId}")
    public ResponseEntity<Void> deleteReply(
            @PathVariable Long projectId,
            @PathVariable Long issueId,
            @PathVariable Long commentId,
            @PathVariable Long replyId
    ) {
        commentService.deleteReply(projectId, issueId, commentId, replyId);
        return ResponseEntity.noContent().build();
    }
}
