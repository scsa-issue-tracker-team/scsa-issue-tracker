package com.scsa.issuetracker.project.repository;

import com.scsa.issuetracker.project.entity.Project;
import com.scsa.issuetracker.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByCreatedById_Id(Long userId);
}
