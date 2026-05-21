package com.scsa.issuetracker.project.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProjectDto {

    private Long id;
    private Long createdById;
    private String name;
    private String description;

}
