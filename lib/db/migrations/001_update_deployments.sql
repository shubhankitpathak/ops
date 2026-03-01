-- Drop old deployments table (if you have no production data yet)
DROP TABLE IF EXISTS deployments;

-- Recreate with new schema
CREATE TABLE deployments (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  github_run_id TEXT,
  deployment_status TEXT NOT NULL DEFAULT 'pending',
  run_status TEXT,
  conclusion TEXT,
  commit_sha TEXT NOT NULL,
  commit_message TEXT,
  commit_author TEXT,
  triggered_at INTEGER NOT NULL,
  matched_at INTEGER,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
);

CREATE INDEX deployments_project_id_idx ON deployments (project_id);
CREATE INDEX deployments_github_run_id_idx ON deployments (github_run_id);
CREATE INDEX deployments_status_idx ON deployments (deployment_status);
