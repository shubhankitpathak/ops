PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_deployments` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`github_run_id` text,
	`deployment_status` text DEFAULT 'pending' NOT NULL,
	`run_status` text,
	`conclusion` text,
	`commit_sha` text NOT NULL,
	`commit_message` text,
	`commit_author` text,
	`triggered_at` integer DEFAULT (unixepoch()) NOT NULL,
	`matched_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_deployments`("id", "project_id", "github_run_id", "deployment_status", "run_status", "conclusion", "commit_sha", "commit_message", "commit_author", "triggered_at", "matched_at", "created_at", "updated_at") SELECT "id", "project_id", "github_run_id", "deployment_status", "run_status", "conclusion", "commit_sha", "commit_message", "commit_author", "triggered_at", "matched_at", "created_at", "updated_at" FROM `deployments`;--> statement-breakpoint
DROP TABLE `deployments`;--> statement-breakpoint
ALTER TABLE `__new_deployments` RENAME TO `deployments`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `deployments_project_id_idx` ON `deployments` (`project_id`);--> statement-breakpoint
CREATE INDEX `deployments_github_run_id_idx` ON `deployments` (`github_run_id`);--> statement-breakpoint
CREATE INDEX `deployments_status_idx` ON `deployments` (`deployment_status`);