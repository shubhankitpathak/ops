// src/lib/db/deployments.js
import { randomUUID } from "crypto";
import { eq, and, lt, desc } from "drizzle-orm";
import { deployments } from "./schema.js";

/**
 * Create a deployment record when triggering a workflow
 */
export async function createDeployment(db, projectId, commitSha, commitMessage, commitAuthor) {
  const id = randomUUID();
  const now = new Date();
  
  // ✅ Use exact schema field names (camelCase)
  const deployment = {
    id,
    projectId,
    githubRunId: null,
    deploymentStatus: "pending",
    runStatus: null,
    conclusion: null,
    commitSha,
    commitMessage: commitMessage || "Deployment triggered",
    commitAuthor: commitAuthor || "Unknown",
    triggeredAt: now,
    matchedAt: null,
    createdAt: now,
    updatedAt: now,
  };
  
  await db.insert(deployments).values(deployment);
  
  console.log(`✅ Created deployment record: ${id}`);
  
  return deployment;
}

/**
 * Match a local deployment with a GitHub workflow run
 */
export async function matchDeploymentWithRun(db, projectId, githubRunId, commitSha, runStatus, conclusion) {
  const now = new Date();
  
  const result = await db
    .update(deployments)
    .set({
      githubRunId: githubRunId.toString(),
      deploymentStatus: "matched",
      runStatus,
      conclusion,
      matchedAt: now,
      updatedAt: now,
    })
    .where(
      and(
        eq(deployments.projectId, projectId),
        eq(deployments.commitSha, commitSha),
        eq(deployments.deploymentStatus, "pending")
      )
    );
  
  return result.changes > 0;
}

/**
 * Mark orphaned deployments (pending for >5 minutes)
 */
export async function markOrphanedDeployments(db, projectId) {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  
  await db
    .update(deployments)
    .set({
      deploymentStatus: "orphaned",
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(deployments.projectId, projectId),
        eq(deployments.deploymentStatus, "pending"),
        lt(deployments.triggeredAt, fiveMinutesAgo)
      )
    );
}

/**
 * Get pending deployments for a project
 */
export async function getPendingDeployments(db, projectId) {
  return await db
    .select()
    .from(deployments)
    .where(
      and(
        eq(deployments.projectId, projectId),
        eq(deployments.deploymentStatus, "pending")
      )
    )
    .orderBy(desc(deployments.triggeredAt));
}

/**
 * Get all deployments (local tracking)
 */
export async function getLocalDeployments(db, projectId, limit = 10) {
  return await db
    .select()
    .from(deployments)
    .where(eq(deployments.projectId, projectId))
    .orderBy(desc(deployments.triggeredAt))
    .limit(limit);
}

/**
 * Update deployment status from GitHub webhook
 */
export async function updateDeploymentStatus(db, githubRunId, runStatus, conclusion) {
  await db
    .update(deployments)
    .set({
      runStatus,
      conclusion,
      updatedAt: new Date(),
    })
    .where(eq(deployments.githubRunId, githubRunId.toString()));
}

/**
 * Get deployment by ID
 */
export async function getDeploymentById(db, deploymentId) {
  const result = await db
    .select()
    .from(deployments)
    .where(eq(deployments.id, deploymentId))
    .limit(1);
  
  return result[0] || null;
}

/**
 * Mark deployment as current/live after rollback
 */
export async function markDeploymentAsLive(db, projectId, deploymentId) {
  const now = new Date();
  
  // First, unmark all deployments for this project
  await db
    .update(deployments)
    .set({
      deploymentStatus: "matched",
      updatedAt: now,
    })
    .where(eq(deployments.projectId, projectId));
  
  // Then mark the specific deployment as live
  await db
    .update(deployments)
    .set({
      deploymentStatus: "live",
      updatedAt: now,
    })
    .where(eq(deployments.id, deploymentId));
}
