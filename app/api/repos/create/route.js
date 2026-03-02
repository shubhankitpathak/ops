// app/api/repos/create/route.js
import { getEnv } from "@/lib/cloudflare/env";
import { getDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getUserGitHubToken } from "@/lib/auth/token";
import {
  createRepository,
  uploadMultipleFiles,
  repositoryExists,
} from "@/lib/github";
import { getTemplate } from "@/lib/templates";

/**
 * POST /api/repos/create - Create new repository with optional template
 * Body: { 
 *   name, 
 *   description?,
 *   isPrivate?,
 *   templateId?,
 *   files?: [{path, content}]
 * }
 */
export async function POST(request) {
  try {
    const env = await getEnv();
    const db = getDB(env);
    
    // Authenticate user
    const user = await getCurrentUser(request);
    if (!user) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    // Parse request body
    const body = await request.json();
    const { 
      name,
      description = "",
      isPrivate = false,
      templateId = null,
      files = []
    } = body;
    
    if (!name) {
      return Response.json(
        { error: "Repository name is required" },
        { status: 400 }
      );
    }
    
    // Get user's GitHub token
    const githubToken = await getUserGitHubToken(db, user.id, env.ENCRYPTION_SECRET);
    
    console.log(`\n📦 Creating repository: ${name}...`);
    
    // STEP 1: Check if repository already exists
    console.log("Step 1/4: Checking if repository exists...");
    const exists = await repositoryExists(githubToken, user.username, name);
    if (exists) {
      return Response.json(
        { error: "Repository already exists with this name" },
        { status: 409 }
      );
    }
    
    // STEP 2: Create repository
    console.log("Step 2/4: Creating GitHub repository...");
    const repo = await createRepository(githubToken, {
      name,
      description,
      isPrivate,
      autoInit: true, // Initialize with README
    });
    
    console.log(`✅ Repository created: ${repo.fullName}`);
    
    // Wait a bit for GitHub to initialize the repository
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // STEP 3: Upload template files or custom files
    let uploadResults = [];
    let filesToUpload = files;
    
    if (templateId && !files.length) {
      console.log(`Step 3/4: Applying template: ${templateId}...`);
      const template = getTemplate(templateId);
      if (!template) {
        return Response.json(
          { error: "Invalid template ID" },
          { status: 400 }
        );
      }
      filesToUpload = template.files;
    }
    
    if (filesToUpload.length > 0) {
      console.log(`Step 3/4: Uploading ${filesToUpload.length} files...`);
      uploadResults = await uploadMultipleFiles(
        githubToken,
        repo.owner,
        repo.name,
        filesToUpload,
        templateId ? `Initialize with ${templateId} template` : "Add project files",
        repo.defaultBranch
      );
      
      const successCount = uploadResults.filter(r => r.success).length;
      console.log(`✅ Uploaded ${successCount}/${filesToUpload.length} files`);
    } else {
      console.log("Step 3/4: No files to upload (skipped)");
    }
    
    // STEP 4: Return success response
    console.log("Step 4/4: Repository setup complete!");
    
    return Response.json({
      success: true,
      message: "Repository created successfully!",
      repository: {
        name: repo.name,
        fullName: repo.fullName,
        owner: repo.owner,
        defaultBranch: repo.defaultBranch,
        htmlUrl: repo.htmlUrl,
        isPrivate,
      },
      uploads: {
        total: filesToUpload.length,
        successful: uploadResults.filter(r => r.success).length,
        failed: uploadResults.filter(r => !r.success).length,
        results: uploadResults,
      },
    });
    
  } catch (error) {
    console.error("Repository creation error:", error);
    return Response.json({ 
      error: error.message,
      details: error.stack 
    }, { status: 500 });
  }
}
