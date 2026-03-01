// src/app/api/cache/cleanup/route.js
import { getEnv } from "@/lib/cloudflare/env";
import { getDB, cleanupExpiredCache, cleanupExpiredSessions } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function POST(request) {
  try {
    // Optional: require admin auth for this endpoint
    // await requireAuth(request);
    
    const env = await getEnv();
    const db = getDB(env);
    
    // Clean up expired cache entries
    const cacheResult = await cleanupExpiredCache(db);
    
    // Clean up expired sessions
    const sessionsResult = await cleanupExpiredSessions(db);
    
    return Response.json({
      success: true,
      cleaned: {
        cache: cacheResult.changes || 0,
        sessions: sessionsResult.changes || 0,
      },
    });
  } catch (error) {
    console.error("Cache cleanup error:", error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
