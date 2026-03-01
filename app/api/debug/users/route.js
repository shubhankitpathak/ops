// app/api/debug/users/route.js
import { getEnv } from "@/lib/cloudflare/env";
import { getDB } from "@/lib/db";
import { users } from "@/lib/db/schema";

/**
 * GET /api/debug/users - List all users (for debugging invitations)
 */
export async function GET(request) {
  try {
    const env = await getEnv();
    const db = getDB(env);

    const allUsers = await db.select().from(users).all();

    return Response.json({
      success: true,
      count: allUsers.length,
      users: allUsers.map((u) => ({
        id: u.id,
        username: u.username,
        email: u.email,
        githubId: u.githubId,
        createdAt: u.createdAt,
      })),
    });
  } catch (error) {
    console.error("Debug users error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
