// app/api/projects/[id]/members/[userId]/route.js
import { getEnv } from "@/lib/cloudflare/env";
import { getDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import {
  getUserRole,
  updateMemberRole,
  removeMember,
  hasPermission,
} from "@/lib/db/project-members";
import { eq } from "drizzle-orm";
import { projects } from "@/lib/db/schema";

/**
 * PATCH /api/projects/[id]/members/[userId] - Update member role
 * Body: { role }
 */
export async function PATCH(request, { params }) {
  try {
    const env = await getEnv();
    const db = getDB(env);
    const { id: projectId, userId: targetUserId } = await params;

    const user = await getCurrentUser(request);
    if (!user) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { role } = body;

    if (!role || !["viewer", "maintainer"].includes(role)) {
      return Response.json(
        { error: "Invalid role. Must be 'viewer' or 'maintainer'" },
        { status: 400 }
      );
    }

    // Check if current user is owner
    const project = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .get();

    if (!project) {
      return Response.json({ error: "Project not found" }, { status: 404 });
    }

    const isOwner = project.userId === user.id;

    if (!isOwner) {
      return Response.json(
        { error: "Only project owners can change roles" },
        { status: 403 }
      );
    }

    // Check if target user is a member
    const memberRole = await getUserRole(db, projectId, targetUserId);
    if (!memberRole) {
      return Response.json(
        { error: "User is not a member of this project" },
        { status: 404 }
      );
    }

    // Update role
    await updateMemberRole(db, projectId, targetUserId, role);

    return Response.json({
      success: true,
      message: `Role updated to ${role}`,
    });
  } catch (error) {
    console.error("Update role error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE /api/projects/[id]/members/[userId] - Remove member from project
 */
export async function DELETE(request, { params }) {
  try {
    const env = await getEnv();
    const db = getDB(env);
    const { id: projectId, userId: targetUserId } = await params;

    const user = await getCurrentUser(request);
    if (!user) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
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
        { error: "Only owners and maintainers can remove members" },
        { status: 403 }
      );
    }

    // Check if target user is a member
    const memberRole = await getUserRole(db, projectId, targetUserId);
    if (!memberRole) {
      return Response.json(
        { error: "User is not a member of this project" },
        { status: 404 }
      );
    }

    // Maintainers cannot remove other maintainers or themselves
    if (!isOwner) {
      if (memberRole.role === "maintainer" || targetUserId === user.id) {
        return Response.json(
          { error: "Maintainers cannot remove maintainers or themselves" },
          { status: 403 }
        );
      }
    }

    // Remove member
    await removeMember(db, projectId, targetUserId);

    return Response.json({
      success: true,
      message: "Member removed from project",
    });
  } catch (error) {
    console.error("Remove member error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
