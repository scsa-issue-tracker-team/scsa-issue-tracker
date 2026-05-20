package com.scsa.issuetracker.project.controller;

import com.scsa.issuetracker.project.dto.ProjectDto;
import com.scsa.issuetracker.project.service.ProjectService;
import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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

}
