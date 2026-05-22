package com.scsa.issuetracker.project.repository;

import com.scsa.issuetracker.project.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByCreatedById_Id(Long userId);
    Optional<Project> findByIdAndCreatedById_Id(Long projectId, Long userId);
    boolean existsByCreatedById_IdAndName(Long userId, String name);
}
