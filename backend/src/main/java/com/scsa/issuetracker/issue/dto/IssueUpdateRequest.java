package com.scsa.issuetracker.issue.dto;

import com.scsa.issuetracker.issue.domain.IssuePriority;
import com.scsa.issuetracker.issue.domain.IssueType;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor

public class IssueUpdateRequest {
    private Long assigneeId;

    @Size(max = 255, message = "이슈 제목은 255자 이하여야 합니다.")
    private String title;

    @Size(max = 10000, message = "이슈 내용은 10000자 이하여야 합니다.")
    private String content;

    private IssueType issueType;
    private IssuePriority priority;
    private LocalDate dueDate;
}
