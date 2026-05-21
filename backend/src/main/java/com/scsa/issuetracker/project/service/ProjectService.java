package com.scsa.issuetracker.project.service;

import com.scsa.issuetracker.project.dto.ProjectDto;
import com.scsa.issuetracker.project.entity.Project;
import com.scsa.issuetracker.project.repository.ProjectRepository;
import com.scsa.issuetracker.user.entity.User;
import com.scsa.issuetracker.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public List<ProjectDto> getProjectByUser(Long userId) {

        List<Project> list = this.projectRepository.findByCreatedById_Id(userId);
        List<ProjectDto> dtoList = new ArrayList<>();
        for (Project p : list) {
            dtoList.add(new ProjectDto(p.getId(), p.getCreatedById().getId(), p.getName(), p.getDescription()));
        }
        return dtoList;

    }

    public ProjectDto getProjectById(Long id) {

        Project p = this.projectRepository.findById(id).orElseThrow(
                () -> new IllegalArgumentException("Project Not Found.")
        );
        return new ProjectDto(p.getId(), p.getCreatedById().getId(), p.getName(), p.getDescription());

    }

    public void createProject(ProjectDto dto) {

        System.out.println(dto.getCreatedById());
        User user = userRepository.findById(dto.getCreatedById()).orElseThrow(
                () -> new IllegalArgumentException("User Not Found.")
        );
        projectRepository.save(new Project(null, user, dto.getName(), dto.getDescription()));

    }

}
