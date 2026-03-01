// src/lib/db/schema.js
import { sql } from "drizzle-orm";
import { 
  sqliteTable, 
  text, 
  integer,
  index,
  uniqueIndex
} from "drizzle-orm/sqlite-core";

// ============================================
// USERS TABLE
// Stores authenticated GitHub users with encrypted tokens
// ============================================
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),  // UUID
  githubId: text("github_id").notNull().unique(),
  username: text("username").notNull(),
  email: text("email"),
  avatarUrl: text("avatar_url"),
  
  // Encrypted GitHub access token (AES-GCM)
  githubTokenEncrypted: text("github_token_encrypted").notNull(),
  // Initialization vector for decryption
  githubTokenIv: text("github_token_iv").notNull(),
  
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
}, (table) => ({
  githubIdIdx: uniqueIndex("users_github_id_idx").on(table.githubId),
}));

// ============================================
// PROJECTS TABLE
// Maps user repositories to Cloudflare Pages projects
// ============================================
export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),  // UUID
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  
  // Project display name
  name: text("name").notNull(),
  
  // GitHub repository identifiers
  repoOwner: text("repo_owner").notNull(),
  repoName: text("repo_name").notNull(),
  
  // Default branch for deployments
  productionBranch: text("production_branch").notNull().default("main"),
  
  // Cloudflare Pages project details
  cfProjectName: text("cf_project_name").notNull(),
  cfSubdomain: text("cf_subdomain").notNull(),
  
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
}, (table) => ({
  userIdIdx: index("projects_user_id_idx").on(table.userId),
  repoIdx: index("projects_repo_idx").on(table.repoOwner, table.repoName),
}));

// ============================================
// DEPLOYMENTS TABLE
// Tracks both local deployment triggers and GitHub Actions runs
// ============================================
export const deployments = sqliteTable("deployments", {
  id: text("id").primaryKey(),  // UUID
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  
  // GitHub Actions run ID (nullable until matched)
  githubRunId: text("github_run_id"),
  
  // Deployment status: "pending" (just triggered), "matched" (synced with GitHub), "orphaned" (never matched)
  deploymentStatus: text("deployment_status").notNull().default("pending"),
  
  // GitHub Actions status: "queued", "in_progress", "completed"
  runStatus: text("run_status"),
  
  // Conclusion: "success", "failure", "cancelled", or null (if still running)
  conclusion: text("conclusion"),
  
  // Git commit info
  commitSha: text("commit_sha").notNull(),
  commitMessage: text("commit_message"),
  commitAuthor: text("commit_author"),
  
  // Timestamps
  triggeredAt: integer("triggered_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  matchedAt: integer("matched_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
}, (table) => ({
  projectIdIdx: index("deployments_project_id_idx").on(table.projectId),
  githubRunIdIdx: index("deployments_github_run_id_idx").on(table.githubRunId),
  deploymentStatusIdx: index("deployments_status_idx").on(table.deploymentStatus),
}));


// ============================================
// SESSIONS TABLE
// Manages user authentication sessions
// ============================================
export const sessions = sqliteTable("sessions", {
  // Session token serves as primary key
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  
  // Expiration timestamp
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
}, (table) => ({
  userIdIdx: index("sessions_user_id_idx").on(table.userId),
  expiresAtIdx: index("sessions_expires_at_idx").on(table.expiresAt),
}));

// ============================================
// CACHE TABLE
// Generic key-value cache for reducing API calls
// ============================================
export const cache = sqliteTable("cache", {
  // Cache key (e.g., "repos:user123", "deployments:project456")
  key: text("key").primaryKey(),
  
  // JSON-serialized cached data
  value: text("value").notNull(),
  
  // Expiration timestamp
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
}, (table) => ({
  expiresAtIdx: index("cache_expires_at_idx").on(table.expiresAt),
}));

// ============================================
// PROJECT MEMBERS TABLE
// Manages team access and permissions for projects
// ============================================
export const projectMembers = sqliteTable("project_members", {
  id: text("id").primaryKey(),  // UUID
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  
  // Role: "owner", "maintainer", "viewer"
  role: text("role").notNull().default("viewer"),
  
  // Invitation details
  invitedBy: text("invited_by")
    .notNull()
    .references(() => users.id),
  invitedAt: integer("invited_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  
  // Status: "pending", "accepted", "declined"
  status: text("status").notNull().default("accepted"),
  
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
}, (table) => ({
  projectIdIdx: index("project_members_project_id_idx").on(table.projectId),
  userIdIdx: index("project_members_user_id_idx").on(table.userId),
  // Unique constraint: one user can only have one role per project
  uniqueMember: uniqueIndex("project_members_unique_idx").on(table.projectId, table.userId),
}));
