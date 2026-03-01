// app/api/projects/[id]/members/route.js
import { getEnv } from "@/lib/cloudflare/env";
import { getDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import {
  getProjectMembers,
  addProjectMember,
  hasPermission,
  findUserByUsername,
  getUserRole,
} from "@/lib/db/project-members";
import { eq } from "drizzle-orm";
import { projects, users } from "@/lib/db/schema";

/**
 * GET /api/projects/[id]/members - Get all members of a project
 */
export async function GET(request, { params }) {
  try {
    const env = await getEnv();
    const db = getDB(env);
    const { id: projectId } = await params;

    const user = await getCurrentUser(request);
    if (!user) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Check if user is owner or member of the project
    const project = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .get();

    if (!project) {
      return Response.json({ error: "Project not found" }, { status: 404 });
    }

    // Check if user has viewer permission (minimum)
    const isOwner = project.userId === user.id;
    const hasPerm = await hasPermission(db, projectId, user.id, "viewer");

    if (!isOwner && !hasPerm) {
      return Response.json({ error: "Access denied" }, { status: 403 });
    }

    const members = await getProjectMembers(db, projectId);

    // Add owner to the list
    const owner = await db
      .select()
      .from(users)
      .where(eq(users.id, project.userId))
      .get();

    const allMembers = [
      {
        userId: owner.id,
        username: owner.username,
        email: owner.email,
        avatarUrl: owner.avatarUrl,
        role: "owner",
        status: "accepted",
        isOwner: true,
        invitedAt: project.createdAt,
      },
      ...members.map((m) => ({
        id: m.id,
        userId: m.userId,
        username: m.username,
        email: m.email,
        avatarUrl: m.avatarUrl,
        role: m.role,
        status: m.status,
        isOwner: false,
        invitedAt: m.invitedAt,
      })),
    ];

    return Response.json({
      success: true,
      members: allMembers,
    });
  } catch (error) {
    console.error("Get members error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/projects/[id]/members - Add a member to a project
 * Body: { username, role }
 */
export async function POST(request, { params }) {
  try {
    const env = await getEnv();
    const db = getDB(env);
    const { id: projectId } = await params;

    const user = await getCurrentUser(request);
    if (!user) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { username, role = "viewer" } = body;

    if (!username) {
      return Response.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    if (!["viewer", "maintainer"].includes(role)) {
      return Response.json(
        { error: "Invalid role. Must be 'viewer' or 'maintainer'" },
        { status: 400 }
      );
    }

    // Check if current user is owner or maintainer
    const project = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .get();

    if (!project) {
      return Response.json({ error: "Project not found" }, { status: 404 });
    }

    const isOwner = project.userId === user.id;
    const hasMaintainerPerm = await hasPermission(db, projectId, user.id, "maintainer");

    if (!isOwner && !hasMaintainerPerm) {
      return Response.json(
        { error: "Only owners and maintainers can add members" },
        { status: 403 }
      );
    }

    // Find user by username
    const invitedUser = await findUserByUsername(db, username);
    if (!invitedUser) {
      return Response.json(
        { 
          error: `User '${username}' not found. They must log in to opsDevHub at least once before being invited.`,
          hint: "Ask them to visit the platform and sign in with GitHub first."
        },
        { status: 404 }
      );
    }

    // Check if user is already a member
    const existingMember = await getUserRole(db, projectId, invitedUser.id);
    if (existingMember) {
      return Response.json(
        { error: "User is already a member of this project" },
        { status: 409 }
      );
    }

    // Add member
    const member = await addProjectMember(db, {
      projectId,
      userId: invitedUser.id,
      role,
      invitedBy: user.id,
    });

    return Response.json({
      success: true,
      message: `${username} added as ${role}`,
      member: {
        id: member.id,
        userId: invitedUser.id,
        username: invitedUser.username,
        email: invitedUser.email,
        avatarUrl: invitedUser.avatarUrl,
        role: member.role,
        status: member.status,
      },
    });
  } catch (error) {
    console.error("Add member error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
