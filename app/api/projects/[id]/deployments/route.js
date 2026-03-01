// src/app/api/projects/[id]/deployments/route.js
import { getEnv } from "@/lib/cloudflare/env";
import { getDB, findProjectById, getPendingDeployments, matchDeploymentWithRun, markOrphanedDeployments, upsertDeployment } from "@/lib/db";
import { markDeploymentAsLive } from "@/lib/db/deployments";
import { getCurrentUser } from "@/lib/auth";
import { getUserGitHubToken } from "@/lib/auth/token";
import { getWorkflowRuns, getCommitDetails } from "@/lib/github";
import { getCachedDeployments } from "@/lib/cache/deployments";
import { hasPermission } from "@/lib/db/project-members";

export async function GET(request, { params }) {
  try {
    const env = await getEnv();
    const db = getDB(env);
    
    const user = await getCurrentUser(request);
    if (!user) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }
    
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
    
    // Get token from project owner (not current user) since they have the GitHub access
    const ownerId = project.userId;
    const token = await getUserGitHubToken(db, ownerId, env.ENCRYPTION_SECRET);
    
    // Check if force refresh requested
    const url = new URL(request.url);
    const forceRefresh = url.searchParams.get("refresh") === "true";
    
    // Fetch deployments with caching
    const { data: githubRuns, fromCache } = await getCachedDeployments(
      db,
      project.id,
      async () => {
        // Fetch workflow runs from GitHub
        const { runs } = await getWorkflowRuns(
          token,
          project.repoOwner,
          project.repoName,
          5
        );
        
        // Enrich with commit details
        const enrichedRuns = await Promise.all(
          runs.map(async (run) => {
            try {
              const { commit } = await getCommitDetails(
                token,
                project.repoOwner,
                project.repoName,
                run.headSha
              );
              
              return {
                ...run,
                commit: {
                  message: commit.message,
                  author: commit.author,
                  sha: commit.sha.slice(0, 7),
                  url: commit.url,
                },
              };
            } catch (error) {
              return {
                ...run,
                commit: {
                  message: "Unable to fetch commit",
                  author: "Unknown",
                  sha: run.headSha.slice(0, 7),
                  url: null,
                },
              };
            }
          })
        );
        
        return enrichedRuns;
      }
    );
    
    // 🔄 SYNC: Persist GitHub workflow runs to database
    console.log(`🔄 Syncing ${githubRuns.length} GitHub deployments to database...`);
    for (const run of githubRuns) {
      try {
        await upsertDeployment(db, {
          projectId: project.id,
          githubRunId: String(run.id), // GitHub run ID
          commitSha: run.headSha,
          commitMessage: run.commit?.message || null,
          commitAuthor: run.commit?.author || null,
          runStatus: run.status, // "queued", "in_progress", "completed"
          conclusion: run.conclusion, // "success", "failure", "cancelled", or null
          deploymentStatus: 'matched', // Already synced from GitHub
          triggeredAt: new Date(run.createdAt),
        });
        console.log(`✅ Synced deployment: github_run_id=${run.id}, status=${run.status}, conclusion=${run.conclusion}`);
      } catch (error) {
        console.error(`❌ Failed to sync deployment ${run.id}:`, error);
      }
    }
    
    // ✅ NEW: Mark old pending deployments as orphaned (>5 minutes)
    await markOrphanedDeployments(db, project.id);
    
    // ✅ NEW: Get pending local deployments
    const pendingDeployments = await getPendingDeployments(db, project.id);
    
    // ✅ NEW: Try to match pending with GitHub runs
    for (const pending of pendingDeployments) {
      const matchingRun = githubRuns.find(run => {
        // Match by SHA (handle both full and short SHA)
        const runSha = run.headSha.toLowerCase();
        const pendingSha = pending.commitSha.toLowerCase();
        return runSha.startsWith(pendingSha) || pendingSha.startsWith(runSha);
      });
      
      if (matchingRun) {
        console.log(`🔗 Matched deployment ${pending.id} with GitHub run ${matchingRun.id}`);
        await matchDeploymentWithRun(
          db,
          project.id,
          matchingRun.id,
          pending.commitSha,
          matchingRun.status,
          matchingRun.conclusion
        );
      }
    }
    
    // ✅ NEW: Refresh pending list after matching
    const stillPending = await getPendingDeployments(db, project.id);
    
    // ✅ NEW: Convert pending deployments to deployment card format
    const pendingCards = stillPending.map(pending => ({
      id: `pending-${pending.id}`, // Unique ID for pending
      status: 'queued',
      conclusion: null,
      headSha: pending.commitSha,
      createdAt: pending.triggeredAt.toISOString(),
      updatedAt: pending.updatedAt.toISOString(),
      url: `https://github.com/${project.repoOwner}/${project.repoName}/actions`,
      commit: {
        message: pending.commitMessage || "Deployment triggered",
        author: pending.commitAuthor || "Unknown",
        sha: pending.commitSha?.slice(0, 7) || "unknown",
        url: `https://github.com/${project.repoOwner}/${project.repoName}/commit/${pending.commitSha}`,
      },
    }));
    
    // ✅ NEW: Merge pending with GitHub runs (pending first)
    const allDeployments = [...pendingCards, ...githubRuns];
    
    // Get live deployment from database
    const { findDeploymentByRunId } = await import("@/lib/db/helpers");
    const deploymentsWithLiveStatus = await Promise.all(
      allDeployments.map(async (d) => {
        // Skip pending deployments
        if (typeof d.id === 'string' && d.id.startsWith('pending-')) {
          return { ...d, isLive: false };
        }
        
        // Check if this deployment is marked as live in DB
        const dbDeployment = await findDeploymentByRunId(db, String(d.id));
        const isLive = dbDeployment?.deploymentStatus === 'live';
        
        if (isLive) {
          console.log(`🟢 Found LIVE deployment: github_run_id=${d.id}, commit=${dbDeployment.commitSha?.slice(0, 7)}`);
        }
        
        return {
          ...d,
          isLive,
        };
      })
    );
    
    // If no deployment is marked as live, mark the most recent successful one as live
    const hasLiveDeployment = deploymentsWithLiveStatus.some(d => d.isLive);
    if (!hasLiveDeployment) {
      console.log(`⚠️ No deployment marked as live, marking most recent successful one...`);
      const mostRecentSuccess = deploymentsWithLiveStatus.find(
        d => d.status === 'completed' && d.conclusion === 'success' && typeof d.id === 'number'
      );
      
      if (mostRecentSuccess) {
        const dbDeployment = await findDeploymentByRunId(db, String(mostRecentSuccess.id));
        if (dbDeployment) {
          await markDeploymentAsLive(db, project.id, dbDeployment.id);
          mostRecentSuccess.isLive = true;
          console.log(`✅ Marked deployment as live: github_run_id=${mostRecentSuccess.id}`);
        }
      }
    }
    
    // Determine if we should keep polling
    const hasActiveDeployment = deploymentsWithLiveStatus.some(
      d => d.status === 'queued' || d.status === 'in_progress'
    );
    
    return Response.json({
      success: true,
      deployments: deploymentsWithLiveStatus,
      fromCache,
      hasActiveDeployment,
      project: {
        id: project.id,
        name: project.name,
        repoOwner: project.repoOwner,
        repoName: project.repoName,
      },
    });
  } catch (error) {
    console.error("Get deployments error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

