package com.scsa.issuetracker.project.repository;

import com.scsa.issuetracker.project.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectRepository extends JpaRepository<Project, Long> {
}
