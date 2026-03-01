// src/app/api/projects/[id]/deployments/[deploymentId]/analyze/route.js
import { getEnv } from "@/lib/cloudflare/env";
import { getDB, findProjectById } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getUserGitHubToken } from "@/lib/auth/token";
import { getWorkflowJobs } from "@/lib/github";
import { analyzeBuildFailure } from "@/lib/ai/openrouter";
import { hasPermission } from "@/lib/db/project-members";

export async function POST(request, { params }) {
  try {
    const env = await getEnv();
    const db = getDB(env);
    
    const user = await getCurrentUser(request);
    if (!user) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    // Await params in Next.js 15
    const { id, deploymentId } = await params;
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
    
    // Use owner's token (not current user's)
    const token = await getUserGitHubToken(db, project.userId, env.ENCRYPTION_SECRET);
    
    console.log(`🤖 Starting AI analysis for deployment ${deploymentId}...`);
    
    // Get jobs for this workflow run
    const { jobs } = await getWorkflowJobs(
      token,
      project.repoOwner,
      project.repoName,
      deploymentId
    );
    
    if (jobs.length === 0) {
      return Response.json({
        error: "No jobs found for this deployment",
      }, { status: 404 });
    }
    
    // Get the main deploy job
    const mainJob = jobs[0];
    
    // Fetch logs
    const logsResponse = await fetch(
      `https://api.github.com/repos/${project.repoOwner}/${project.repoName}/actions/jobs/${mainJob.id}/logs`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );
    
    if (!logsResponse.ok) {
      return Response.json({
        error: "Failed to fetch build logs",
      }, { status: 500 });
    }
    
    const logs = await logsResponse.text();
    
    // Analyze with AI
    console.log(`🧠 Analyzing logs with AI (${logs.length} chars)...`);
    const result = await analyzeBuildFailure(logs, env.OPENROUTER_API_KEY);
    
    if (!result.success) {
      return Response.json({
        error: "AI analysis failed",
        details: result.error,
      }, { status: 500 });
    }
    
    console.log(`✅ AI analysis complete`);
    console.log(`   Category: ${result.analysis.category}`);
    console.log(`   Confidence: ${result.analysis.confidence}`);
    
    return Response.json({
      success: true,
      analysis: result.analysis,
    });
  } catch (error) {
    console.error("Analyze deployment error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
