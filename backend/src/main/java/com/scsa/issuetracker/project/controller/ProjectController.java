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
    public List<ProjectDto> projectList() {
        return this.projectService.getProjects();
    }

    @GetMapping("/projects/{projectsId}")
    public ProjectDto projectOfId(@PathVariable("projectsId") Long id) { return this.projectService.getProjectById(id); }

    @PostMapping("/projects")
    public void newProject(@RequestBody ProjectDto dto) {
        this.projectService.createProject(dto);
    }

}
