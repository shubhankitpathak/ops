// app/api/projects/bulk-invite/route.js
import { getEnv } from "@/lib/cloudflare/env";
import { getDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { addProjectMember, findUserByUsername } from "@/lib/db/project-members";
import { eq, and } from "drizzle-orm";
import { projects, projectMembers } from "@/lib/db/schema";

/**
 * POST /api/projects/bulk-invite
 * Invite a user to all projects owned by the current user
 * Body: { username: string, role: 'viewer' | 'maintainer' }
 */
export async function POST(request) {
  try {
    const env = await getEnv();
    const db = getDB(env);
    
    const user = await getCurrentUser(request);
    if (!user) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    const body = await request.json();
    const { username, role } = body;
    
    // Validate inputs
    if (!username?.trim()) {
      return Response.json({ error: "Username is required" }, { status: 400 });
    }
    
    if (!role || !["viewer", "maintainer"].includes(role)) {
      return Response.json({ error: "Role must be 'viewer' or 'maintainer'" }, { status: 400 });
    }
    
    // Find the user to invite
    const invitedUser = await findUserByUsername(db, username.trim());
    if (!invitedUser) {
      return Response.json({ error: `User '${username}' not found` }, { status: 404 });
    }
    
    // Can't invite yourself
    if (invitedUser.id === user.id) {
      return Response.json({ error: "Cannot invite yourself" }, { status: 400 });
    }
    
    // Get all projects owned by the current user
    const ownedProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.userId, user.id))
      .all();
    
    if (ownedProjects.length === 0) {
      return Response.json({ error: "You don't own any projects" }, { status: 400 });
    }
    
    // Add member to each project
    const results = {
      succeeded: [],
      failed: [],
      skipped: [],
    };
    
    for (const project of ownedProjects) {
      try {
        // Check if user is already a member
        const existingMember = await db
          .select()
          .from(projectMembers)
          .where(
            and(
              eq(projectMembers.projectId, project.id),
              eq(projectMembers.userId, invitedUser.id)
            )
          )
          .get();
        
        if (existingMember) {
          results.skipped.push({
            projectId: project.id,
            projectName: project.name,
            reason: `Already a ${existingMember.role}`,
          });
          continue;
        }
        
        await addProjectMember(db, {
          projectId: project.id,
          userId: invitedUser.id,
          role,
          invitedBy: user.id,
        });
        
        results.succeeded.push({
          projectId: project.id,
          projectName: project.name,
        });
      } catch (error) {
        results.failed.push({
          projectId: project.id,
          projectName: project.name,
          error: error.message,
        });
      }
    }
    
    return Response.json({
      success: true,
      message: `Invited ${username} to ${results.succeeded.length} project(s)`,
      results: {
        total: ownedProjects.length,
        succeeded: results.succeeded.length,
        failed: results.failed.length,
        skipped: results.skipped.length,
      },
      details: results,
      invitedUser: {
        username: invitedUser.username,
        role,
      },
    });
  } catch (error) {
    console.error("Bulk invite error:", error);
    return Response.json(
      { error: error.message || "Failed to invite user" },
      { status: 500 }
    );
  }
}
