CREATE INDEX idx_issues_project_status ON issues (project_id, status);
CREATE INDEX idx_issues_assignee_status ON issues (assignee_id, status);
CREATE INDEX idx_comments_issue_parent ON comments (issue_id, parent_id);
CREATE INDEX idx_reactions_target ON reactions (target_type, target_id);
CREATE INDEX idx_activity_actor_created ON activity_logs (actor_id, created_at);
CREATE INDEX idx_notifications_receiver ON notifications (receiver_id, read_at, deleted_at);
