// src/app/api/projects/route.js
import { getEnv } from "@/lib/cloudflare/env";
import { getDB, createProject, getProjectsByUserId, findProjectByRepo, createDeployment  } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getUserGitHubToken } from "@/lib/auth/token";
import { invalidateReposCache } from "@/lib/cache/repos";
import {
  setRepoSecret,
  setRepoVariable,
  checkWorkflowExists,
  getWorkflowTemplate,
  commitWorkflowFile,
  getCommitDetails 
} from "@/lib/github";
import { generatePagesProjectName, createPagesProject } from "@/lib/cloudflare/pages";
import { setPagesEnvVars } from "@/lib/cloudflare/env-vars";

/**
 * GET /api/projects - List all projects for current user
 */
export async function GET(request) {
  try {
    const env = await getEnv();
    const db = getDB(env);
    
    const user = await getCurrentUser(request);
    if (!user) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    const projects = await getProjectsByUserId(db, user.id);
    
    return Response.json({
      success: true,
      projects: projects.map(p => ({
        id: p.id,
        name: p.name,
        repoOwner: p.repoOwner,
        repoName: p.repoName,
        productionBranch: p.productionBranch,
        cfProjectName: p.cfProjectName,
        cfSubdomain: p.cfSubdomain,
        url: `https://${p.cfSubdomain}`,
        createdAt: p.createdAt,
        isOwner: p.userId === user.id, // True if user created this project
      })),
    });
  } catch (error) {
    console.error("Get projects error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/projects - Create new deployment
 * Body: { repoOwner, repoName, defaultBranch, customSubdomain?, envVars? }
 */
export async function POST(request) {
  try {
    const env = await getEnv();
    const db = getDB(env);
    
    // Step 0: Authenticate user
    const user = await getCurrentUser(request);
    if (!user) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    // Parse request body
    const body = await request.json();
    const { 
      repoOwner, 
      repoName, 
      defaultBranch = "main",
      customSubdomain,
      envVars = []
    } = body;
    
    if (!repoOwner || !repoName) {
      return Response.json(
        { error: "repoOwner and repoName are required" },
        { status: 400 }
      );
    }
    
    // Check if project already exists
    const existing = await findProjectByRepo(db, repoOwner, repoName);
    if (existing) {
      return Response.json(
        { error: "Project already exists for this repository" },
        { status: 409 }
      );
    }
    
    // Get user's GitHub token
    const githubToken = await getUserGitHubToken(db, user.id, env.ENCRYPTION_SECRET);
    
    console.log(`\n🚀 Starting deployment for ${repoOwner}/${repoName}...`);
    
    // STEP 1: Create Cloudflare Pages project
    console.log("📦 Step 1/9: Creating Cloudflare Pages project...");
    const cfProjectName = customSubdomain || generatePagesProjectName(repoName);
    const cfProject = await createPagesProject(
      env.CF_ACCOUNT_ID,
      env.CF_API_TOKEN,
      cfProjectName,
      defaultBranch
    );
    console.log(`   ✅ Created: ${cfProject.subdomain}`);
    
    // STEP 2: Check if workflow already exists
    console.log("📝 Step 2/9: Checking for existing workflow...");
    const workflowCheck = await checkWorkflowExists(githubToken, repoOwner, repoName);
    console.log(`   ${workflowCheck.exists ? "⚠️  Found existing workflow" : "✅ No existing workflow"}`);
    
    // STEP 3: Set GitHub secret - ops_CF_TOKEN
    console.log("🔐 Step 3/9: Setting ops_CF_TOKEN secret...");
    await setRepoSecret(
      githubToken,
      repoOwner,
      repoName,
      "ops_CF_TOKEN",
      env.CF_API_TOKEN
    );
    console.log("   ✅ Secret set");
    
    // STEP 4: Set GitHub secret - ops_ACCOUNT_ID
    console.log("🔐 Step 4/9: Setting ops_ACCOUNT_ID secret...");
    await setRepoSecret(
      githubToken,
      repoOwner,
      repoName,
      "ops_ACCOUNT_ID",
      env.CF_ACCOUNT_ID
    );
    console.log("   ✅ Secret set");
    
    // STEP 4.5: Set custom environment variables (both GitHub Secrets + Cloudflare)
    const customEnvVarKeys = [];
    if (envVars && envVars.length > 0) {
      console.log(`🔐 Step 4.5/9: Setting ${envVars.length} custom environment variables...`);
      
      // Filter valid env vars
      const validEnvVars = envVars.filter(v => v.key && v.value);
      
      for (const envVar of validEnvVars) {
        // Set as GitHub Secret (for build-time access)
        await setRepoSecret(
          githubToken,
          repoOwner,
          repoName,
          envVar.key,
          envVar.value
        );
        
        customEnvVarKeys.push(envVar.key);
      }
      
      // Also set in Cloudflare Pages (for runtime access)
      await setPagesEnvVars(
        env.CF_ACCOUNT_ID,
        env.CF_API_TOKEN,
        cfProjectName,
        validEnvVars,
        "production"
      );
      
      console.log(`   ✅ Set ${validEnvVars.length} env vars in GitHub Secrets and Cloudflare Pages`);
    }
    
    // STEP 5: Set GitHub variable - ops_PROJECT_NAME
    console.log("📌 Step 5/9: Setting ops_PROJECT_NAME variable...");
    const varResult = await setRepoVariable(
      githubToken,
      repoOwner,
      repoName,
      "ops_PROJECT_NAME",
      cfProjectName
    );
    console.log(`   ✅ Variable ${varResult.action}`);
    
    // STEP 6: Commit workflow file (with custom env vars)
    console.log("📄 Step 6/9: Committing workflow file...");
    const workflowContent = getWorkflowTemplate(cfProjectName, customEnvVarKeys);
    const commitResult = await commitWorkflowFile(
      githubToken,
      repoOwner,
      repoName,
      workflowContent,
      workflowCheck.sha
    );
    console.log(`   ✅ Workflow ${workflowCheck.exists ? "updated" : "created"}`);
    
    // STEP 7: Save project to database
    console.log("💾 Step 7/9: Saving project to database...");
    const project = await createProject(db, {
      userId: user.id,
      name: repoName,
      repoOwner,
      repoName,
      productionBranch: defaultBranch,
      cfProjectName: cfProjectName,
      cfSubdomain: cfProject.subdomain,
    });
    console.log(`   ✅ Project saved with ID: ${project.id}`);
    
    // STEP 8: Invalidate repos cache
      console.log("♻️  Step 8/9: Invalidating repos cache...");
      await invalidateReposCache(db, user.id);
      console.log("   ✅ Cache invalidated");

      // STEP 9: Track deployment locally
      console.log("📝 Step 9/9: Creating deployment tracking record...");
      try {
        // Get the latest commit details from the branch
        const { commit } = await getCommitDetails(
          githubToken,
          repoOwner,
          repoName,
          defaultBranch
        );
        
        // Create deployment record
        await createDeployment(
          db,
          project.id,
          commit.sha,
          commit.message,
          commit.author
        );
        
        console.log(`   ✅ Deployment tracked (SHA: ${commit.sha.slice(0, 7)})`);
      } catch (error) {
        console.error("   ⚠️  Failed to track deployment:", error.message);
        // Don't fail the whole request if tracking fails
      }

      console.log(`\n✨ Deployment complete! Workflow will trigger automatically.\n`);
    
    // Return success response
    return Response.json({
      success: true,
      message: "Deployment triggered successfully!",
      project: {
        id: project.id,
        name: project.name,
        repoOwner: project.repoOwner,
        repoName: project.repoName,
        cfProjectName: project.cfProjectName,
        url: `https://${project.cfSubdomain}`,
        workflowUrl: `https://github.com/${repoOwner}/${repoName}/actions`,
        envVarsSet: customEnvVarKeys.length,
      },
    });
  } catch (error) {
    console.error("❌ Deployment error:", error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
