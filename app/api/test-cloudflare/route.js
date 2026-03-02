// src/app/api/test-cloudflare/route.js
import { getEnv } from "@/lib/cloudflare/env";
import { getDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getUserGitHubToken } from "@/lib/auth/token";
import { fetchUserRepos } from "@/lib/github/graphql";
import { generatePagesProjectName, createPagesProject } from "@/lib/cloudflare/pages";

export async function GET(request) {
  try {
    const env = await getEnv();
    const db = getDB(env);
    
    const user = await getCurrentUser(request);
    if (!user) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    const url = new URL(request.url);
    const action = url.searchParams.get("action") || "create-project";
    
    if (action === "create-project") {
      // 1) Get user's GitHub token
      const token = await getUserGitHubToken(db, user.id, env.ENCRYPTION_SECRET);
      
      // 2) Fetch first repo to simulate selection
      const { repos } = await fetchUserRepos(token, 1);
      if (!repos.length) {
        return Response.json({ error: "No repos found in your GitHub" }, { status: 400 });
      }
      
      const repo = repos[0];
      
      // 3) Generate Pages project name
      const projectName = generatePagesProjectName(repo.name);
      
      // 4) Create Cloudflare Pages project
      const cfProject = await createPagesProject(
        env.CF_ACCOUNT_ID,
        env.CF_API_TOKEN,
        projectName,
        repo.defaultBranch
      );
      
      return Response.json({
        success: true,
        repo: {
          owner: repo.owner,
          name: repo.name,
          defaultBranch: repo.defaultBranch,
        },
        cloudflare: cfProject,
      });
    }
    
    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Cloudflare test error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
