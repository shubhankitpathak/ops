// app/api/projects/[id]/analytics/route.js
import { getEnv } from "@/lib/cloudflare/env";
import { getDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/db/project-members";
import { eq } from "drizzle-orm";
import { projects } from "@/lib/db/schema";
import { 
  getProjectAnalytics, 
  getPerformanceMetrics,
  getStatusCodeMetrics,
  calculateAnalyticsSummary 
} from "@/lib/cloudflare/analytics";

/**
 * GET /api/projects/:id/analytics
 * Get analytics data for a project
 */
export async function GET(request, { params }) {
  try {
    const env = await getEnv();
    const db = getDB(env);
    const { id } = await params;
    
    const user = await getCurrentUser(request);
    if (!user) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    // Check if user has permission to view this project
    const canView = await hasPermission(db, id, user.id, "viewer");
    if (!canView) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
    
    // Get project details
    const project = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id))
      .get();
    
    if (!project) {
      return Response.json({ error: "Project not found" }, { status: 404 });
    }
    
    // Get query parameters
    const url = new URL(request.url);
    const days = parseInt(url.searchParams.get("days") || "7");
    
    // Use realistic generated data (demo mode)
    console.log(`📊 Generating realistic analytics for: ${project.cfProjectName}`);
    
    const { generateRealisticAnalytics } = await import("@/lib/cloudflare/analytics");
    const generated = generateRealisticAnalytics(project.name, project.cfProjectName, days);
    
    const analyticsResult = {
      success: true,
      data: generated.data,
      period: generated.period
    };
    
    const performanceResult = {
      success: true,
      data: generated.performance
    };
    
    // Calculate summary statistics
    const summary = calculateAnalyticsSummary(analyticsResult.data);
    
    // Process performance data
    const performanceData = performanceResult.data;
    
    // Process status codes
    const statusCodes = generated.statusCodes;
    
    // Format response
    return Response.json({
      success: true,
      project: {
        id: project.id,
        name: project.name,
        cfProjectName: project.cfProjectName,
        subdomain: project.cfSubdomain,
      },
      period: {
        days,
        since: analyticsResult.period?.since,
        now: analyticsResult.period?.now,
      },
      summary,
      performance: performanceData,
      statusCodes,
      rawData: analyticsResult.data,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return Response.json(
      { 
        error: error.message || "Failed to fetch analytics",
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}
