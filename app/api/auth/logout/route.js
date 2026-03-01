// src/app/api/auth/logout/route.js
import { getEnv } from "@/lib/cloudflare/env";
import { getDB } from "@/lib/db";
import { getSessionFromRequest, clearSession, clearSessionCookie } from "@/lib/auth/session";

export async function POST(request) {
  try {
    const env = await getEnv();
    const db = getDB(env);
    
    // Get session from cookie
    const sessionId = getSessionFromRequest(request);
    
    // Delete session from database
    if (sessionId) {
      await clearSession(db, sessionId);
    }
    
    // Clear session cookie
    const cookie = clearSessionCookie();
    
    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": cookie,
        },
      }
    );
  } catch (error) {
    console.error("Logout error:", error);
    return Response.json(
      { error: "Failed to logout" },
      { status: 500 }
    );
  }
}

// Also support GET for simple logout links
export async function GET(request) {
  try {
    const env = await getEnv();
    const db = getDB(env);
    
    const sessionId = getSessionFromRequest(request);
    
    if (sessionId) {
      await clearSession(db, sessionId);
    }
    
    const cookie = clearSessionCookie();
    const url = new URL(request.url);
    
    return new Response(null, {
      status: 302,
      headers: {
        Location: url.origin,
        "Set-Cookie": cookie,
      },
    });
  } catch (error) {
    console.error("Logout error:", error);
    const url = new URL(request.url);
    return Response.redirect(url.origin);
  }
}
