CREATE SEQUENCE chat_messages_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE chat_messages (
    id BIGINT NOT NULL,
    created_at TIMESTAMP(6) NOT NULL,
    updated_at TIMESTAMP(6) NOT NULL,
    project_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    CONSTRAINT pk_chat_messages PRIMARY KEY (id),
    CONSTRAINT fk_chat_messages_project FOREIGN KEY (project_id) REFERENCES projects (id),
    CONSTRAINT fk_chat_messages_sender FOREIGN KEY (sender_id) REFERENCES users (id)
);

CREATE INDEX idx_chat_messages_project_created ON chat_messages (project_id, created_at DESC, id DESC);
CREATE INDEX idx_chat_messages_sender ON chat_messages (sender_id);
