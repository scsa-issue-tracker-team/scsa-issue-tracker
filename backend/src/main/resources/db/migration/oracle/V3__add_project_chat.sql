CREATE SEQUENCE chat_messages_seq START WITH 1 INCREMENT BY 1 NOCACHE;

CREATE TABLE chat_messages (
    id NUMBER(19) NOT NULL,
    created_at TIMESTAMP(6) NOT NULL,
    updated_at TIMESTAMP(6) NOT NULL,
    project_id NUMBER(19) NOT NULL,
    sender_id NUMBER(19) NOT NULL,
    content CLOB NOT NULL,
    CONSTRAINT pk_chat_messages PRIMARY KEY (id),
    CONSTRAINT fk_chat_messages_project FOREIGN KEY (project_id) REFERENCES projects (id),
    CONSTRAINT fk_chat_messages_sender FOREIGN KEY (sender_id) REFERENCES users (id)
);

CREATE INDEX idx_chat_msg_proj_created ON chat_messages (project_id, created_at DESC, id DESC);
CREATE INDEX idx_chat_msg_sender ON chat_messages (sender_id);
