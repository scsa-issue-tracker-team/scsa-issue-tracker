package com.scsa.issuetracker.project.entity;

import com.scsa.issuetracker.global.entity.BaseTimeEntity;

import com.scsa.issuetracker.user.entity.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(
        name="projects",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "projects_unique_createdbyid_name",
                        columnNames = {"created_by_id", "name"}
                )
        }
)
@NoArgsConstructor(access= AccessLevel.PROTECTED)
@AllArgsConstructor
public class Project extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "projects_seq_gen")
    @SequenceGenerator(name = "projects_seq_gen", sequenceName = "projects_seq", allocationSize = 1)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id", nullable = false)
    private User createdById;

    @Column(nullable = false, length = 100)
    private String name;

    private String description;

    public static Project create(User creator, String name, String description) {
        return new Project(null, creator, name, description);
    }
}
