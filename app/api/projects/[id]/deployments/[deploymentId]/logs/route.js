// src/app/api/projects/[id]/deployments/[deploymentId]/logs/route.js
import { getEnv } from "@/lib/cloudflare/env";
import { getDB, findProjectById } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getUserGitHubToken } from "@/lib/auth/token";
import { getWorkflowJobs } from "@/lib/github";
import { hasPermission } from "@/lib/db/project-members";

export async function GET(request, { params }) {
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
    
    // Get jobs for this workflow run
    const { jobs } = await getWorkflowJobs(
      token,
      project.repoOwner,
      project.repoName,
      deploymentId
    );
    
    if (jobs.length === 0) {
      return Response.json({
        success: true,
        logs: "No jobs found for this deployment.",
        steps: [],
      });
    }
    
    // Get the main deploy job (usually the first one)
    const mainJob = jobs[0];
    
    // Fetch logs for this job
    let logs = "Fetching logs...";
    try {
      const logsResponse = await fetch(
        `https://api.github.com/repos/${project.repoOwner}/${project.repoName}/actions/jobs/${mainJob.id}/logs`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      );
      
      if (logsResponse.ok) {
        logs = await logsResponse.text();
      } else {
        logs = `Unable to fetch logs (Status: ${logsResponse.status})`;
      }
    } catch (error) {
      logs = `Error fetching logs: ${error.message}`;
    }
    
    return Response.json({
      success: true,
      job: {
        id: mainJob.id,
        name: mainJob.name,
        status: mainJob.status,
        conclusion: mainJob.conclusion,
        startedAt: mainJob.startedAt,
        completedAt: mainJob.completedAt,
      },
      steps: mainJob.steps || [],
      logs,
    });
  } catch (error) {
    console.error("Get logs error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
