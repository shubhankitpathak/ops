// src/app/api/test-github/route.js
import { getEnv } from "@/lib/cloudflare/env";
import { getDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getUserGitHubToken } from "@/lib/auth/token";
import { fetchUserRepos } from "@/lib/github/graphql";
import { getCachedRepos } from "@/lib/cache/repos";

export async function GET(request) {
  try {
    const env = await getEnv();
    const db = getDB(env);
    
    // Get current user
    const user = await getCurrentUser(request);
    if (!user) {
      return Response.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }
    
    // Get decrypted GitHub token
    const token = await getUserGitHubToken(db, user.id, env.ENCRYPTION_SECRET);
    
    const url = new URL(request.url);
    const action = url.searchParams.get("action") || "repos";
    
    if (action === "repos") {
      // Fetch repos with caching
      const { data: repos, fromCache } = await getCachedRepos(
        db,
        user.id,
        async () => {
          const { repos } = await fetchUserRepos(token, 50);
          return repos;
        }
      );
      
      return Response.json({
        success: true,
        fromCache,
        count: repos.length,
        repos: repos.slice(0, 10), // Return first 10 for testing
      });
    }
    
    if (action === "rate-limit") {
      // Just check rate limit status
      const { repos, rateLimit } = await fetchUserRepos(token, 1);
      
      return Response.json({
        success: true,
        rateLimit,
      });
    }
    
    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("GitHub test error:", error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
