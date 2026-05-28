CREATE SEQUENCE users_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE projects_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE project_members_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE issues_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE comments_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE reactions_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE activity_logs_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE notifications_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE users (
    id BIGINT NOT NULL,
    created_at TIMESTAMP(6) NOT NULL,
    updated_at TIMESTAMP(6) NOT NULL,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    CONSTRAINT pk_users PRIMARY KEY (id),
    CONSTRAINT uk_users_username UNIQUE (username),
    CONSTRAINT uk_users_email UNIQUE (email)
);

CREATE TABLE projects (
    id BIGINT NOT NULL,
    created_at TIMESTAMP(6) NOT NULL,
    updated_at TIMESTAMP(6) NOT NULL,
    created_by_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    CONSTRAINT pk_projects PRIMARY KEY (id),
    CONSTRAINT fk_projects_created_by FOREIGN KEY (created_by_id) REFERENCES users (id),
    CONSTRAINT uk_projects_creator_name UNIQUE (created_by_id, name)
);

CREATE TABLE project_members (
    id BIGINT NOT NULL,
    created_at TIMESTAMP(6) NOT NULL,
    updated_at TIMESTAMP(6) NOT NULL,
    project_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    role VARCHAR(20) NOT NULL,
    CONSTRAINT pk_project_members PRIMARY KEY (id),
    CONSTRAINT fk_project_members_project FOREIGN KEY (project_id) REFERENCES projects (id),
    CONSTRAINT fk_project_members_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT uk_proj_members_proj_user UNIQUE (project_id, user_id),
    CONSTRAINT chk_project_members_role CHECK (role IN ('OWNER', 'MEMBER'))
);

CREATE TABLE issues (
    id BIGINT NOT NULL,
    created_at TIMESTAMP(6) NOT NULL,
    updated_at TIMESTAMP(6) NOT NULL,
    reporter_id BIGINT NOT NULL,
    assignee_id BIGINT,
    project_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    issue_type VARCHAR(255) NOT NULL,
    status VARCHAR(255) NOT NULL,
    priority VARCHAR(255) NOT NULL,
    due_date DATE,
    CONSTRAINT pk_issues PRIMARY KEY (id),
    CONSTRAINT chk_issues_type CHECK (issue_type IN ('BUG', 'FEATURE', 'REQUEST', 'TASK')),
    CONSTRAINT chk_issues_status CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')),
    CONSTRAINT chk_issues_priority CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'))
);

CREATE TABLE comments (
    id BIGINT NOT NULL,
    created_at TIMESTAMP(6) NOT NULL,
    updated_at TIMESTAMP(6) NOT NULL,
    author_id BIGINT NOT NULL,
    issue_id BIGINT NOT NULL,
    parent_id BIGINT,
    content TEXT NOT NULL,
    deleted BOOLEAN DEFAULT FALSE NOT NULL,
    CONSTRAINT pk_comments PRIMARY KEY (id)
);

CREATE TABLE reactions (
    id BIGINT NOT NULL,
    created_at TIMESTAMP(6) NOT NULL,
    updated_at TIMESTAMP(6) NOT NULL,
    target_type VARCHAR(20) NOT NULL,
    target_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    reaction_type VARCHAR(30) NOT NULL,
    CONSTRAINT pk_reactions PRIMARY KEY (id),
    CONSTRAINT uk_reactions_target_user_type UNIQUE (target_type, target_id, user_id, reaction_type),
    CONSTRAINT chk_reactions_target_type CHECK (target_type IN ('ISSUE', 'COMMENT')),
    CONSTRAINT chk_reactions_type CHECK (reaction_type IN ('THUMBS_UP', 'HEART', 'EYES', 'ROCKET', 'CHECK', 'LAUGH'))
);

CREATE TABLE activity_logs (
    id BIGINT NOT NULL,
    created_at TIMESTAMP(6) NOT NULL,
    updated_at TIMESTAMP(6) NOT NULL,
    project_id BIGINT NOT NULL,
    issue_id BIGINT NOT NULL,
    actor_id BIGINT NOT NULL,
    activity_type VARCHAR(40) NOT NULL,
    message VARCHAR(500) NOT NULL,
    CONSTRAINT pk_activity_logs PRIMARY KEY (id),
    CONSTRAINT chk_activity_logs_type CHECK (
        activity_type IN (
            'ISSUE_CREATED',
            'ISSUE_UPDATED',
            'ISSUE_STATUS_CHANGED',
            'ISSUE_ASSIGNEE_CHANGED',
            'COMMENT_CREATED',
            'COMMENT_UPDATED',
            'COMMENT_DELETED'
        )
    )
);

CREATE TABLE notifications (
    id BIGINT NOT NULL,
    created_at TIMESTAMP(6) NOT NULL,
    updated_at TIMESTAMP(6) NOT NULL,
    receiver_id BIGINT NOT NULL,
    actor_id BIGINT NOT NULL,
    project_id BIGINT NOT NULL,
    issue_id BIGINT NOT NULL,
    comment_id BIGINT,
    notification_type VARCHAR(30) NOT NULL,
    message VARCHAR(500) NOT NULL,
    read_at TIMESTAMP(6),
    deleted_at TIMESTAMP(6),
    CONSTRAINT pk_notifications PRIMARY KEY (id),
    CONSTRAINT chk_notifications_type CHECK (
        notification_type IN (
            'ISSUE_ASSIGNED',
            'ISSUE_STATUS_CHANGED',
            'COMMENT_CREATED',
            'REPLY_CREATED',
            'REACTION_ADDED'
        )
    )
);
