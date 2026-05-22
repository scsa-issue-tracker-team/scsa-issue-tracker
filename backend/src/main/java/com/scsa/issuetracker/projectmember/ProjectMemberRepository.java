package com.scsa.issuetracker.projectmember;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {

    List<ProjectMember> findByProject_Id(Long projectId);

    List<ProjectMember> findByUser_Id(Long userId);

    boolean existsByProject_IdAndUser_Id(Long projectId, Long userId);

    boolean existsByProject_IdAndUser_IdAndRole(Long projectId, Long userId, ProjectMemberRole role);

    Optional<ProjectMember> findByProject_IdAndUser_Id(Long projectId, Long userId);
}
