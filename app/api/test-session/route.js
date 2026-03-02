// src/app/api/test-session/route.js
import { getEnv } from "@/lib/cloudflare/env";
import { getDB, generateId, upsertUser } from "@/lib/db";
import { createUserSession, createSessionCookie } from "@/lib/auth/session";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request) {
  try {
    const env = await getEnv();
    const db = getDB(env);
    
    const url = new URL(request.url);
    const action = url.searchParams.get("action") || "check";
    
    // Check current session
    if (action === "check") {
      const user = await getCurrentUser(request);
      
      return Response.json({
        authenticated: !!user,
        user: user ? {
          id: user.id,
          username: user.username,
          email: user.email,
        } : null,
      });
    }
    
    // Create test session
    if (action === "create") {
      // Create a test user
      const testUser = await upsertUser(db, {
        githubId: "test_" + Date.now(),
        username: "test_user",
        email: "test@example.com",
        avatarUrl: null,
        githubTokenEncrypted: "test_encrypted",
        githubTokenIv: "test_iv",
      });
      
      // Create session
      const session = await createUserSession(db, testUser.id);
      
      // Set cookie
      const cookie = createSessionCookie(session.id, session.expiresAt);
      
      return new Response(
        JSON.stringify({
          success: true,
          message: "Test session created",
          sessionId: session.id,
          expiresAt: session.expiresAt,
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Set-Cookie": cookie,
          },
        }
      );
    }
    
    return Response.json({ error: "Invalid action" }, { status: 400 });
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
