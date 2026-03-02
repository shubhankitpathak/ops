// src/app/api/test-cache/route.js
import { getEnv } from "@/lib/cloudflare/env";
import { getDB } from "@/lib/db";
import { createCacheManager } from "@/lib/cache/manager";
import { getCachedRepos, invalidateReposCache } from "@/lib/cache/repos";

export async function GET(request) {
  try {
    const env = await getEnv();
    const db = getDB(env);
    const url = new URL(request.url);
    const action = url.searchParams.get("action") || "test";
    
    if (action === "test") {
      // Test basic cache operations
      const cache = createCacheManager(db);
      const testKey = "test_key";
      const testValue = { message: "Hello from cache!", timestamp: Date.now() };
      
      // Set cache
      await cache.set(testKey, testValue, 60);
      
      // Get cache
      const retrieved = await cache.get(testKey);
      
      // Test getOrFetch
      const { data, fromCache } = await cache.getOrFetch(
        "test_fetch_key",
        async () => ({ computed: "Fresh data", time: Date.now() }),
        60
      );
      
      return Response.json({
        success: true,
        tests: {
          set_and_get: retrieved !== null && retrieved.message === testValue.message,
          get_or_fetch: data !== null && !fromCache,
        },
        retrieved,
        fetched: { data, fromCache },
      });
    }
    
    if (action === "repos") {
      // Test repos caching
      const testUserId = "test_user_123";
      
      // Simulate fetching repos
      const mockFetch = async () => {
        return [
          { name: "repo1", owner: "testuser", language: "JavaScript" },
          { name: "repo2", owner: "testuser", language: "Python" },
        ];
      };
      
      // First call - should fetch
      const first = await getCachedRepos(db, testUserId, mockFetch);
      
      // Second call - should come from cache
      const second = await getCachedRepos(db, testUserId, mockFetch);
      
      // Invalidate
      await invalidateReposCache(db, testUserId);
      
      // Third call - should fetch again
      const third = await getCachedRepos(db, testUserId, mockFetch);
      
      return Response.json({
        success: true,
        results: {
          first: { fromCache: first.fromCache, count: first.data.length },
          second: { fromCache: second.fromCache, count: second.data.length },
          third: { fromCache: third.fromCache, count: third.data.length },
        },
        expected: {
          first_from_cache: false,
          second_from_cache: true,
          third_from_cache: false,
        },
      });
    }
    
    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Cache test error:", error);
    return Response.json(
      {
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
