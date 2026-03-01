// src/app/api/projects/[id]/route.js
import { getEnv } from "@/lib/cloudflare/env";
import { getDB, findProjectById, deleteProject } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/db/project-members";

/**
 * GET /api/projects/[id] - Get single project details
 */
export async function GET(request, { params }) {
  try {
    const env = await getEnv();
    const db = getDB(env);
    
    const user = await getCurrentUser(request);
    if (!user) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    // ✅ FIX: Await params in Next.js 15
    const { id } = await params;
    const project = await findProjectById(db, id);
    
    if (!project) {
      return Response.json({ error: "Project not found" }, { status: 404 });
    }
    
    // Check if user is owner or has viewer permission (minimum access)
    const isOwner = project.userId === user.id;
    const isMember = await hasPermission(db, id, user.id, "viewer");
    
    if (!isOwner && !isMember) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
    
    return Response.json({
      success: true,
      project: {
        id: project.id,
        name: project.name,
        repoOwner: project.repoOwner,
        repoName: project.repoName,
        productionBranch: project.productionBranch,
        cfProjectName: project.cfProjectName,
        cfSubdomain: project.cfSubdomain,
        url: `https://${project.cfSubdomain}`,
        githubUrl: `https://github.com/${project.repoOwner}/${project.repoName}`,
        workflowUrl: `https://github.com/${project.repoOwner}/${project.repoName}/actions`,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get project error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE /api/projects/[id] - Delete project
 */
export async function DELETE(request, { params }) {
  try {
    const env = await getEnv();
    const db = getDB(env);
    
    const user = await getCurrentUser(request);
    if (!user) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    // ✅ FIX: Await params in Next.js 15
    const { id } = await params;
    const project = await findProjectById(db, id);
    
    if (!project) {
      return Response.json({ error: "Project not found" }, { status: 404 });
    }
    
    // Verify ownership
    if (project.userId !== user.id) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
    
    // Delete from database
    await deleteProject(db, id);
    
    // Note: Cloudflare Pages project and GitHub secrets remain
    // User can manually delete them if needed
    
    return Response.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Delete project error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
