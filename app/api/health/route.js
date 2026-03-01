// src/app/api/health/route.js
import { getDB, users, cache } from "@/lib/db";
import { getEnv } from "@/lib/cloudflare/env";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    const env = await getEnv();
    
    // Basic checks
    const checks = {
      database: "unknown",
      tables: "unknown",
      github_oauth: !!env.GITHUB_CLIENT_ID ? "configured" : "missing",
      cloudflare_api: !!env.CF_ACCOUNT_ID ? "configured" : "missing",
    };
    
    // Test database connection
    if (env.DB) {
      try {
        const db = getDB(env);
        
        // Simple query to test connection
        const result = await db.select({ count: sql`1` }).from(users).limit(1);
        checks.database = "connected";
        
        // Count tables (verify schema exists)
        const tableCheck = await db.run(sql`
          SELECT name FROM sqlite_master WHERE type='table'
        `);
        checks.tables = `${tableCheck.results?.length || 0} tables found`;
        
      } catch (dbError) {
        checks.database = `error: ${dbError.message}`;
      }
    } else {
      checks.database = "DB binding not found";
    }
    
    return Response.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      checks,
    });
  } catch (error) {
    return Response.json(
      {
        status: "error",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
