// src/app/api/stats/route.js
import { getEnv } from "@/lib/cloudflare/env";
import { getDB, projects, deployments } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { eq, and, inArray } from "drizzle-orm";

export async function GET(request) {
  try {
    const env = await getEnv();
    const db = getDB(env);
    
    const user = await getCurrentUser(request);
    if (!user) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    // Get user's projects
    const userProjects = await db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.userId, user.id));
    
    if (userProjects.length === 0) {
      return Response.json({
        success: true,
        stats: {
          totalProjects: 0,
          activeDeployments: 0,
          successfulDeployments: 0,
        },
      });
    }
    
    const projectIds = userProjects.map(p => p.id);
    
    // Get all deployments for user's projects
    const allDeployments = await db
      .select()
      .from(deployments)
      .where(inArray(deployments.projectId, projectIds));
    
    // Calculate stats
    const activeDeployments = allDeployments.filter(d => 
      d.runStatus === 'queued' || 
      d.runStatus === 'in_progress' ||
      d.deploymentStatus === 'pending'
    ).length;
    
    const successfulDeployments = allDeployments.filter(d => 
      d.runStatus === 'completed' && 
      d.conclusion === 'success'
    ).length;
    
    return Response.json({
      success: true,
      stats: {
        totalProjects: userProjects.length,
        activeDeployments,
        successfulDeployments,
      },
    });
  } catch (error) {
    console.error("Get stats error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
