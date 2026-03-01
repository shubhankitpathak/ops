// src/app/api/cache/stats/route.js
import { getEnv } from "@/lib/cloudflare/env";
import { getDB } from "@/lib/db";
import { cache as cacheTable } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

export async function GET(request) {
  try {
    const env = await getEnv();
    const db = getDB(env);
    
    // Get total cache entries
    const totalResult = await db
      .select({ count: sql`count(*)` })
      .from(cacheTable);
    const total = totalResult[0]?.count || 0;
    
    // Get expired entries
    const expiredResult = await db
      .select({ count: sql`count(*)` })
      .from(cacheTable)
      .where(sql`${cacheTable.expiresAt} <= unixepoch()`);
    const expired = expiredResult[0]?.count || 0;
    
    // Get cache breakdown by key prefix
    const allEntries = await db.select().from(cacheTable);
    
    const breakdown = allEntries.reduce((acc, entry) => {
      const prefix = entry.key.split(":")[0];
      acc[prefix] = (acc[prefix] || 0) + 1;
      return acc;
    }, {});
    
    return Response.json({
      total: parseInt(total),
      active: parseInt(total) - parseInt(expired),
      expired: parseInt(expired),
      breakdown,
    });
  } catch (error) {
    console.error("Cache stats error:", error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
