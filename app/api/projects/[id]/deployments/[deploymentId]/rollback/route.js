// app/api/projects/[id]/deployments/[deploymentId]/rollback/route.js
import { NextResponse } from "next/server";
import { getEnv } from "@/lib/cloudflare/env";
import { getDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getDeploymentById, markDeploymentAsLive } from "@/lib/db/deployments";
import { findProjectById } from "@/lib/db/helpers";
import { promoteDeployment, getPagesDeployments } from "@/lib/cloudflare/pages";
import { hasPermission } from "@/lib/db/project-members";

export async function POST(request, { params }) {
  try {
    const env = await getEnv();
    const db = getDB(env);
    
    // Check authentication
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Await params in Next.js 15
    const { id: projectId, deploymentId } = await params;
    
    // Get project
    const project = await findProjectById(db, projectId);
    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }
    
    // Check if user is owner or maintainer (rollback requires maintainer permission)
    const isOwner = project.userId === user.id;
    const isMaintainer = await hasPermission(db, projectId, user.id, "maintainer");
    
    if (!isOwner && !isMaintainer) {
      return NextResponse.json(
        { error: "Forbidden - Requires maintainer permission" },
        { status: 403 }
      );
    }
    
    // Get deployment details
    // deploymentId here is actually the GitHub run ID from the UI
    // We need to find our local deployment record by GitHub run ID
    const { findDeploymentByRunId } = await import("@/lib/db/helpers");
    const deployment = await findDeploymentByRunId(db, deploymentId);
    
    if (!deployment) {
      console.error(`Deployment not found in database. GitHub Run ID: ${deploymentId}, Project ID: ${projectId}`);
      return NextResponse.json(
        { error: "Deployment not found in database. This deployment may not have been tracked locally. Only deployments triggered through this platform can be rolled back." },
        { status: 404 }
      );
    }
    
    if (deployment.projectId !== projectId) {
      return NextResponse.json(
        { error: "Deployment does not belong to this project" },
        { status: 400 }
      );
    }
    
    // Check if deployment was successful
    if (deployment.conclusion !== "success") {
      return NextResponse.json(
        { error: "Can only rollback to successful deployments" },
        { status: 400 }
      );
    }
    
    // Get Cloudflare credentials from environment
    const accountId = env.CF_ACCOUNT_ID;
    const apiToken = env.CF_API_TOKEN;
    
    if (!accountId || !apiToken) {
      return NextResponse.json(
        { error: "Cloudflare credentials not configured" },
        { status: 500 }
      );
    }
    
    // Promote deployment in Cloudflare
    console.log(`Rolling back project ${project.cfProjectName} to deployment ${deploymentId} (commit: ${deployment.commitSha})`);
    
    // Fetch all deployments from Cloudflare to find the matching one
    const cfDeployments = await getPagesDeployments(accountId, apiToken, project.cfProjectName);
    
    console.log(`📦 Found ${cfDeployments.length} Cloudflare deployments`);
    console.log(`🔍 Looking for commit SHA: ${deployment.commitSha}`);
    
    // Log the first deployment structure for debugging
    if (cfDeployments.length > 0) {
      console.log(`📋 Sample CF deployment structure:`, JSON.stringify(cfDeployments[0], null, 2));
    }
    
    // Find the Cloudflare deployment matching our commit SHA
    const cfDeployment = cfDeployments.find(d => {
      const commitHash = d.deploymentTrigger?.metadata?.commit_hash;
      console.log(`Checking deployment ${d.id}: commit=${commitHash}`);
      return commitHash === deployment.commitSha;
    });
    
    if (!cfDeployment) {
      console.error(`❌ No Cloudflare deployment found for commit ${deployment.commitSha}`);
      console.error(`Available commits:`, cfDeployments.map(d => d.deploymentTrigger?.metadata?.commit_hash));
      return NextResponse.json(
        { error: "Could not find corresponding Cloudflare deployment" },
        { status: 404 }
      );
    }
    
    // Promote the deployment
    await promoteDeployment(accountId, apiToken, project.cfProjectName, cfDeployment.id);
    
    // Mark deployment as live in database (use deployment.id, not deploymentId which is the GitHub run ID)
    await markDeploymentAsLive(db, projectId, deployment.id);
    
    return NextResponse.json({
      success: true,
      message: "Deployment rolled back successfully",
      deployment: {
        id: deployment.id,
        commitSha: deployment.commitSha,
        commitMessage: deployment.commitMessage,
        url: cfDeployment.url,
      },
    });
  } catch (error) {
    console.error("Rollback error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to rollback deployment" },
      { status: 500 }
    );
  }
}
