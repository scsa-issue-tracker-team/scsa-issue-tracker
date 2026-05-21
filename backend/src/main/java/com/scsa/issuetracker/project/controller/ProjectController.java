package com.scsa.issuetracker.project.controller;

import com.scsa.issuetracker.project.dto.ProjectDto;
import com.scsa.issuetracker.project.service.ProjectService;
import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1")
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping("/projects")
    // TODO : SUBSTITUTE REQUEST PARAMETER TO LOGIN ID
    public List<ProjectDto> projectOfUser(@RequestParam Long userId) {
        return this.projectService.getProjectByUser(userId);
    }

    @PostMapping("/projects")
    // TODO : SUBSTITUTE CREATED_BY_ID IN REQUEST BODY TO LOGIN ID
    public void newProject(@RequestBody ProjectDto dto) {
        this.projectService.createProject(dto);
    }

    @GetMapping("/projects/{projectsId}")
    public ProjectDto projectOfId(@PathVariable("projectsId") Long id) { return this.projectService.getProjectById(id); }

}
