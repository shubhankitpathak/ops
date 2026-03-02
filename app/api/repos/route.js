// src/app/api/repos/route.js
import { getEnv } from "@/lib/cloudflare/env";
import { getDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getUserGitHubToken } from "@/lib/auth/token";
import { fetchUserRepos } from "@/lib/github/graphql";
import { getCachedRepos, invalidateReposCache } from "@/lib/cache/repos";

export async function GET(request) {
  try {
    const env = await getEnv();
    const db = getDB(env);
    
    const user = await getCurrentUser(request);
    if (!user) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    const token = await getUserGitHubToken(db, user.id, env.ENCRYPTION_SECRET);
    
    // Check if force refresh requested
    const url = new URL(request.url);
    const forceRefresh = url.searchParams.get("refresh") === "true";
    
    // Invalidate cache if refresh requested
    if (forceRefresh) {
      await invalidateReposCache(db, user.id);
    }
    
    // Fetch repos with caching
    const { data: repos, fromCache } = await getCachedRepos(
      db,
      user.id,
      async () => {
        const { repos } = await fetchUserRepos(token, 100);
        return repos;
      }
    );
    
    // Filter out archived and optionally forks
    const includeArchived = url.searchParams.get("includeArchived") === "true";
    const includeForks = url.searchParams.get("includeForks") === "true";
    
    const filteredRepos = repos.filter(repo => {
      if (!includeArchived && repo.isArchived) return false;
      if (!includeForks && repo.isFork) return false;
      return true;
    });
    
    return Response.json({
      success: true,
      repos: filteredRepos,
      fromCache,
      total: filteredRepos.length,
    });
  } catch (error) {
    console.error("Get repos error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
