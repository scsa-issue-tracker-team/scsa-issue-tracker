-- Manual Oracle migration for the issue status/type contract.
--
-- Why this exists:
-- Hibernate created Oracle CHECK constraints from the old Java enum values.
-- Changing Java enums alone is not enough because Oracle still rejects values
-- that are not allowed by the old constraints.
--
-- Old contract:
--   issue_type: BUG / FEATURE / TASK
--   status: OPEN / IN_PROGRESS / DONE / CLOSED
--
-- New contract:
--   issue_type: BUG / FEATURE / REQUEST / TASK
--   status: OPEN / IN_PROGRESS / RESOLVED / CLOSED

-- 1. Find old enum CHECK constraints.
--    Drop only constraints whose search_condition is about issue_type/status enum values.
--    Do not drop NOT NULL constraints.
SELECT constraint_name, search_condition
FROM user_constraints
WHERE table_name = 'ISSUES'
  AND constraint_type = 'C';

-- 2. Drop old enum constraints.
--    Replace SYS_C... names with the actual names from step 1.
--
-- ALTER TABLE issues DROP CONSTRAINT SYS_C_OLD_ISSUE_TYPE;
-- ALTER TABLE issues DROP CONSTRAINT SYS_C_OLD_STATUS;

-- 3. Convert old DONE rows if any exist.
UPDATE issues
SET status = 'RESOLVED'
WHERE status = 'DONE';

-- 4. Add new explicit constraints.
ALTER TABLE issues ADD CONSTRAINT issues_check_issue_type
    CHECK (issue_type IN ('BUG', 'FEATURE', 'REQUEST', 'TASK'));

ALTER TABLE issues ADD CONSTRAINT issues_check_status
    CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'));

COMMIT;
