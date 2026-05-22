package com.scsa.issuetracker.project.dto;

import com.scsa.issuetracker.project.entity.Project;

import java.time.LocalDateTime;

public record ProjectResponse(
        Long id,
        Long createdById,
        String name,
        String description,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {

    public static ProjectResponse from(Project project) {
        return new ProjectResponse(
                project.getId(),
                project.getCreatedById().getId(),
                project.getName(),
                project.getDescription(),
                project.getCreatedAt(),
                project.getUpdatedAt()
        );
    }
}
