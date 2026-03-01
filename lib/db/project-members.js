// lib/db/project-members.js
import { eq, and, sql } from "drizzle-orm";
import { projectMembers, users } from "./schema.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Get all members of a project with user details
 */
export async function getProjectMembers(db, projectId) {
  const members = await db
    .select({
      id: projectMembers.id,
      projectId: projectMembers.projectId,
      userId: projectMembers.userId,
      role: projectMembers.role,
      status: projectMembers.status,
      invitedAt: projectMembers.invitedAt,
      createdAt: projectMembers.createdAt,
      // User details
      username: users.username,
      email: users.email,
      avatarUrl: users.avatarUrl,
    })
    .from(projectMembers)
    .leftJoin(users, eq(projectMembers.userId, users.id))
    .where(eq(projectMembers.projectId, projectId))
    .all();

  return members;
}

/**
 * Get user's role in a project
 */
export async function getUserRole(db, projectId, userId) {
  const member = await db
    .select({
      role: projectMembers.role,
      status: projectMembers.status,
    })
    .from(projectMembers)
    .where(
      and(
        eq(projectMembers.projectId, projectId),
        eq(projectMembers.userId, userId)
      )
    )
    .get();

  return member;
}

/**
 * Check if user has permission for a project
 * Permissions hierarchy: owner > maintainer > viewer
 */
export async function hasPermission(db, projectId, userId, requiredRole) {
  const member = await getUserRole(db, projectId, userId);
  
  if (!member || member.status !== "accepted") {
    return false;
  }

  const roleHierarchy = {
    owner: 3,
    maintainer: 2,
    viewer: 1,
  };

  const userLevel = roleHierarchy[member.role] || 0;
  const requiredLevel = roleHierarchy[requiredRole] || 0;

  return userLevel >= requiredLevel;
}

/**
 * Add a member to a project
 */
export async function addProjectMember(db, data) {
  const { projectId, userId, role, invitedBy, status = "accepted" } = data;

  const member = {
    id: uuidv4(),
    projectId,
    userId,
    role,
    invitedBy,
    status,
  };

  await db.insert(projectMembers).values(member).run();

  return member;
}

/**
 * Update member role
 */
export async function updateMemberRole(db, projectId, userId, newRole) {
  await db
    .update(projectMembers)
    .set({ role: newRole, updatedAt: new Date() })
    .where(
      and(
        eq(projectMembers.projectId, projectId),
        eq(projectMembers.userId, userId)
      )
    )
    .run();
}

/**
 * Remove a member from a project
 */
export async function removeMember(db, projectId, userId) {
  await db
    .delete(projectMembers)
    .where(
      and(
        eq(projectMembers.projectId, projectId),
        eq(projectMembers.userId, userId)
      )
    )
    .run();
}

/**
 * Get all projects where user is a member
 */
export async function getUserProjectMemberships(db, userId) {
  const memberships = await db
    .select()
    .from(projectMembers)
    .where(eq(projectMembers.userId, userId))
    .all();

  return memberships;
}

/**
 * Find user by GitHub username (case-insensitive)
 */
export async function findUserByUsername(db, username) {
  const user = await db
    .select()
    .from(users)
    .where(sql`LOWER(${users.username}) = LOWER(${username})`)
    .get();

  return user;
}
