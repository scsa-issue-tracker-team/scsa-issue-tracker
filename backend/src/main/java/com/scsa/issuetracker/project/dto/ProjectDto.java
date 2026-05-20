package com.scsa.issuetracker.project.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProjectDto {

    private Long id;
    private Long createdById;
    private String name;
    private String description;

}
