// src/lib/db/helpers.js
import { eq, and, lt, desc, sql } from "drizzle-orm";
import { users, projects, deployments, sessions, cache } from "./schema.js";

/**
 * Generate a UUID v4
 * @returns {string} UUID string
 */
export function generateId() {
  return crypto.randomUUID();
}

// ============================================
// USER HELPERS
// ============================================

/**
 * Find user by GitHub ID
 */
export async function findUserByGithubId(db, githubId) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.githubId, githubId))
    .limit(1);
  return result[0] || null;
}

/**
 * Find user by ID
 */
export async function findUserById(db, id) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  return result[0] || null;
}

/**
 * Create or update user
 */
export async function upsertUser(db, userData) {
  const existing = await findUserByGithubId(db, userData.githubId);
  
  if (existing) {
    await db
      .update(users)
      .set({
        ...userData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, existing.id));
    return { ...existing, ...userData };
  }
  
  const newUser = {
    id: generateId(),
    ...userData,
  };
  await db.insert(users).values(newUser);
  return newUser;
}

// ============================================
// SESSION HELPERS
// ============================================

/**
 * Create a new session
 */
export async function createSession(db, userId, expiresInDays = 7) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + expiresInDays * 24 * 60 * 60 * 1000);
  
  const session = {
    id: generateId(),
    userId,
    expiresAt: expiresAt,
  };
  
  await db.insert(sessions).values(session);
  
  return {
    id: session.id,
    userId: session.userId,
    expiresAt: expiresAt,
    createdAt: now,
  };
}

/**
 * Find valid session by ID
 */
export async function findValidSession(db, sessionId) {
  // Use SQL function unixepoch() for current time to avoid Date object issues
  const result = await db
    .select()
    .from(sessions)
    .where(
      and(
        eq(sessions.id, sessionId),
        sql`${sessions.expiresAt} > unixepoch()` // Compare using SQL
      )
    )
    .limit(1);
  
  return result[0] || null;
}

/**
 * Delete session
 */
export async function deleteSession(db, sessionId) {
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}

/**
 * Clean up expired sessions
 */
export async function cleanupExpiredSessions(db) {
  const result = await db
    .delete(sessions)
    .where(sql`${sessions.expiresAt} <= unixepoch()`);
  return result;
}

// ============================================
// PROJECT HELPERS
// ============================================

/**
 * Get all projects for a user (owned + member of)
 */
export async function getProjectsByUserId(db, userId) {
  const { projectMembers } = await import("./schema.js");
  
  // Get projects where user is owner
  const ownedProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.userId, userId))
    .all();
  
  // Get projects where user is a member (maintainer/viewer)
  const memberProjects = await db
    .select({
      id: projects.id,
      userId: projects.userId,
      name: projects.name,
      repoOwner: projects.repoOwner,
      repoName: projects.repoName,
      productionBranch: projects.productionBranch,
      cfProjectName: projects.cfProjectName,
      cfSubdomain: projects.cfSubdomain,
      createdAt: projects.createdAt,
      updatedAt: projects.updatedAt,
      memberRole: projectMembers.role,
      memberStatus: projectMembers.status,
    })
    .from(projectMembers)
    .innerJoin(projects, eq(projectMembers.projectId, projects.id))
    .where(
      and(
        eq(projectMembers.userId, userId),
        eq(projectMembers.status, "accepted")
      )
    )
    .all();
  
  // Combine and deduplicate (user might be both owner and member)
  const allProjects = [...ownedProjects];
  const ownedIds = new Set(ownedProjects.map(p => p.id));
  
  for (const mp of memberProjects) {
    if (!ownedIds.has(mp.id)) {
      allProjects.push({
        id: mp.id,
        userId: mp.userId,
        name: mp.name,
        repoOwner: mp.repoOwner,
        repoName: mp.repoName,
        productionBranch: mp.productionBranch,
        cfProjectName: mp.cfProjectName,
        cfSubdomain: mp.cfSubdomain,
        createdAt: mp.createdAt,
        updatedAt: mp.updatedAt,
      });
    }
  }
  
  // Sort by creation date (newest first)
  return allProjects.sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );
}

/**
 * Find project by ID
 */
export async function findProjectById(db, projectId) {
  const result = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);
  return result[0] || null;
}

/**
 * Find project by repo
 */
export async function findProjectByRepo(db, repoOwner, repoName) {
  const result = await db
    .select()
    .from(projects)
    .where(
      and(
        eq(projects.repoOwner, repoOwner),
        eq(projects.repoName, repoName)
      )
    )
    .limit(1);
  return result[0] || null;
}

/**
 * Create a new project
 */
export async function createProject(db, projectData) {
  const { addProjectMember } = await import("./project-members.js");
  
  const project = {
    id: generateId(),
    ...projectData,
  };
  await db.insert(projects).values(project);
  
  // Automatically add creator as owner in projectMembers table
  if (projectData.userId) {
    await addProjectMember(db, {
      projectId: project.id,
      userId: projectData.userId,
      role: "owner",
      invitedBy: projectData.userId, // Self-invited
      status: "accepted", // Owner is automatically accepted
    });
  }
  
  return project;
}

/**
 * Delete project
 */
export async function deleteProject(db, projectId) {
  await db.delete(projects).where(eq(projects.id, projectId));
}

// ============================================
// DEPLOYMENT HELPERS
// ============================================

/**
 * Get deployments for a project
 */
export async function getDeploymentsByProjectId(db, projectId, limit = 10) {
  return db
    .select()
    .from(deployments)
    .where(eq(deployments.projectId, projectId))
    .orderBy(desc(deployments.createdAt))
    .limit(limit);
}

/**
 * Find deployment by GitHub run ID
 */
export async function findDeploymentByRunId(db, githubRunId) {
  const result = await db
    .select()
    .from(deployments)
    .where(eq(deployments.githubRunId, githubRunId))
    .limit(1);
  return result[0] || null;
}

/**
 * Create or update deployment
 */
export async function upsertDeployment(db, deploymentData) {
  const existing = await findDeploymentByRunId(db, deploymentData.githubRunId);
  
  if (existing) {
    await db
      .update(deployments)
      .set({
        ...deploymentData,
        updatedAt: new Date(),
      })
      .where(eq(deployments.id, existing.id));
    return { ...existing, ...deploymentData };
  }
  
  const newDeployment = {
    id: generateId(),
    ...deploymentData,
  };
  await db.insert(deployments).values(newDeployment);
  return newDeployment;
}

// ============================================
// CACHE HELPERS
// ============================================

/**
 * Get cached value
 * @returns {any|null} Parsed JSON value or null if expired/missing
 */
export async function getCache(db, key) {
  const result = await db
    .select()
    .from(cache)
    .where(eq(cache.key, key))
    .limit(1);
  
  if (!result[0]) return null;
  
  // Check if expired using SQL comparison
  const expiredCheck = await db
    .select()
    .from(cache)
    .where(
      and(
        eq(cache.key, key),
        sql`${cache.expiresAt} <= unixepoch()`
      )
    )
    .limit(1);
  
  if (expiredCheck.length > 0) {
    // Delete expired entry
    await db.delete(cache).where(eq(cache.key, key));
    return null;
  }
  
  return JSON.parse(result[0].value);
}

/**
 * Set cache value
 * @param {number} ttlSeconds - Time to live in seconds
 */
export async function setCache(db, key, value, ttlSeconds) {
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
  
  await db
    .insert(cache)
    .values({
      key,
      value: JSON.stringify(value),
      expiresAt: expiresAt,
    })
    .onConflictDoUpdate({
      target: cache.key,
      set: {
        value: JSON.stringify(value),
        expiresAt: expiresAt,
      },
    });
}

/**
 * Delete cache entry
 */
export async function deleteCache(db, key) {
  await db.delete(cache).where(eq(cache.key, key));
}

/**
 * Clean up all expired cache entries
 */
export async function cleanupExpiredCache(db) {
  return db.delete(cache).where(sql`${cache.expiresAt} <= unixepoch()`);
}
