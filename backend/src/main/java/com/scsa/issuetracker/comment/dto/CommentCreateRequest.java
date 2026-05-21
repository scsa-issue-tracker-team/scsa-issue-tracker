package com.scsa.issuetracker.comment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class CommentCreateRequest {

    @NotNull(message = "작성자 ID는 필수입니다.")
    private Long authorId;

    @NotBlank(message = "내용을 입력해주세요.")
    @Size(max = 2000, message = "내용은 2000자 이하로 입력해주세요.")
    private String content;
}