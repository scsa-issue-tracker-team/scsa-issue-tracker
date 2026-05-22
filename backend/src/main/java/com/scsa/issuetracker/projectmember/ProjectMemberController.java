package com.scsa.issuetracker.projectmember;

import com.scsa.issuetracker.projectmember.dto.ProjectMemberAddRequest;
import com.scsa.issuetracker.projectmember.dto.ProjectMemberResponse;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/projects/{projectId}/members")
public class ProjectMemberController {

    private final ProjectMemberService projectMemberService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProjectMemberResponse addMember(
            @PathVariable Long projectId,
            @Valid @RequestBody ProjectMemberAddRequest request
    ) {
        return projectMemberService.addMember(projectId, request);
    }

    @GetMapping
    public List<ProjectMemberResponse> getMembers(@PathVariable Long projectId) {
        return projectMemberService.getMembers(projectId);
    }
}
