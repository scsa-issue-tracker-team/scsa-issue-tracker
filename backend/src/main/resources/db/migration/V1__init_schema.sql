CREATE SEQUENCE users_seq START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE projects_seq START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE project_members_seq START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE issues_seq START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE comments_seq START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE reactions_seq START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE activity_logs_seq START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE notifications_seq START WITH 1 INCREMENT BY 1 NOCACHE;

CREATE TABLE users (
    id NUMBER(19) NOT NULL,
    created_at TIMESTAMP(6) NOT NULL,
    updated_at TIMESTAMP(6) NOT NULL,
    username VARCHAR2(50 CHAR) NOT NULL,
    email VARCHAR2(100 CHAR) NOT NULL,
    password VARCHAR2(255 CHAR) NOT NULL,
    CONSTRAINT pk_users PRIMARY KEY (id),
    CONSTRAINT uk_users_username UNIQUE (username),
    CONSTRAINT uk_users_email UNIQUE (email)
);

CREATE TABLE projects (
    id NUMBER(19) NOT NULL,
    created_at TIMESTAMP(6) NOT NULL,
    updated_at TIMESTAMP(6) NOT NULL,
    created_by_id NUMBER(19) NOT NULL,
    name VARCHAR2(100 CHAR) NOT NULL,
    description VARCHAR2(255 CHAR),
    CONSTRAINT pk_projects PRIMARY KEY (id),
    CONSTRAINT fk_projects_created_by FOREIGN KEY (created_by_id) REFERENCES users (id),
    CONSTRAINT uk_projects_creator_name UNIQUE (created_by_id, name)
);

CREATE TABLE project_members (
    id NUMBER(19) NOT NULL,
    created_at TIMESTAMP(6) NOT NULL,
    updated_at TIMESTAMP(6) NOT NULL,
    project_id NUMBER(19) NOT NULL,
    user_id NUMBER(19) NOT NULL,
    role VARCHAR2(20 CHAR) NOT NULL,
    CONSTRAINT pk_project_members PRIMARY KEY (id),
    CONSTRAINT fk_project_members_project FOREIGN KEY (project_id) REFERENCES projects (id),
    CONSTRAINT fk_project_members_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT uk_proj_members_proj_user UNIQUE (project_id, user_id),
    CONSTRAINT chk_project_members_role CHECK (role IN ('OWNER', 'MEMBER'))
);

CREATE TABLE issues (
    id NUMBER(19) NOT NULL,
    created_at TIMESTAMP(6) NOT NULL,
    updated_at TIMESTAMP(6) NOT NULL,
    reporter_id NUMBER(19) NOT NULL,
    assignee_id NUMBER(19),
    project_id NUMBER(19) NOT NULL,
    title VARCHAR2(255 CHAR) NOT NULL,
    content CLOB,
    issue_type VARCHAR2(255 CHAR) NOT NULL,
    status VARCHAR2(255 CHAR) NOT NULL,
    priority VARCHAR2(255 CHAR) NOT NULL,
    due_date DATE,
    CONSTRAINT pk_issues PRIMARY KEY (id),
    CONSTRAINT chk_issues_type CHECK (issue_type IN ('BUG', 'FEATURE', 'REQUEST', 'TASK')),
    CONSTRAINT chk_issues_status CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')),
    CONSTRAINT chk_issues_priority CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'))
);

CREATE TABLE comments (
    id NUMBER(19) NOT NULL,
    created_at TIMESTAMP(6) NOT NULL,
    updated_at TIMESTAMP(6) NOT NULL,
    author_id NUMBER(19) NOT NULL,
    issue_id NUMBER(19) NOT NULL,
    parent_id NUMBER(19),
    content CLOB NOT NULL,
    deleted NUMBER(1) DEFAULT 0 NOT NULL,
    CONSTRAINT pk_comments PRIMARY KEY (id),
    CONSTRAINT chk_comments_deleted CHECK (deleted IN (0, 1))
);

CREATE TABLE reactions (
    id NUMBER(19) NOT NULL,
    created_at TIMESTAMP(6) NOT NULL,
    updated_at TIMESTAMP(6) NOT NULL,
    target_type VARCHAR2(20 CHAR) NOT NULL,
    target_id NUMBER(19) NOT NULL,
    user_id NUMBER(19) NOT NULL,
    reaction_type VARCHAR2(30 CHAR) NOT NULL,
    CONSTRAINT pk_reactions PRIMARY KEY (id),
    CONSTRAINT uk_reactions_target_user_type UNIQUE (target_type, target_id, user_id, reaction_type),
    CONSTRAINT chk_reactions_target_type CHECK (target_type IN ('ISSUE', 'COMMENT')),
    CONSTRAINT chk_reactions_type CHECK (reaction_type IN ('THUMBS_UP', 'HEART', 'EYES', 'ROCKET', 'CHECK', 'LAUGH'))
);

CREATE TABLE activity_logs (
    id NUMBER(19) NOT NULL,
    created_at TIMESTAMP(6) NOT NULL,
    updated_at TIMESTAMP(6) NOT NULL,
    project_id NUMBER(19) NOT NULL,
    issue_id NUMBER(19) NOT NULL,
    actor_id NUMBER(19) NOT NULL,
    activity_type VARCHAR2(40 CHAR) NOT NULL,
    message VARCHAR2(500 CHAR) NOT NULL,
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
    id NUMBER(19) NOT NULL,
    created_at TIMESTAMP(6) NOT NULL,
    updated_at TIMESTAMP(6) NOT NULL,
    receiver_id NUMBER(19) NOT NULL,
    actor_id NUMBER(19) NOT NULL,
    project_id NUMBER(19) NOT NULL,
    issue_id NUMBER(19) NOT NULL,
    comment_id NUMBER(19),
    notification_type VARCHAR2(30 CHAR) NOT NULL,
    message VARCHAR2(500 CHAR) NOT NULL,
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
