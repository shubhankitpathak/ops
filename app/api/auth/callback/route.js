// src/app/api/auth/callback/route.js
import { getEnv } from "@/lib/cloudflare/env";
import { getDB, upsertUser } from "@/lib/db";
import { exchangeCodeForToken, getGitHubUser } from "@/lib/auth/github";
import { encryptToken } from "@/lib/crypto/encryption";
import { createUserSession, createSessionCookie } from "@/lib/auth/session";

export async function GET(request) {
  try {
    const env = await getEnv();
    const db = getDB(env);
    const url = new URL(request.url);
    
    // Get authorization code from query params
    const code = url.searchParams.get("code");
    const error = url.searchParams.get("error");
    
    // Handle GitHub OAuth errors
    if (error) {
      console.error("GitHub OAuth error:", error);
      return Response.redirect(`${url.origin}/?error=access_denied`);
    }
    
    if (!code) {
      return Response.redirect(`${url.origin}/?error=missing_code`);
    }
    
    // Step 1: Exchange code for access token
    const accessToken = await exchangeCodeForToken(
      code,
      env.GITHUB_CLIENT_ID,
      env.GITHUB_CLIENT_SECRET
    );
    
    // Step 2: Get user info from GitHub
    const githubUser = await getGitHubUser(accessToken);
    
    // Step 3: Encrypt the access token
    const { encrypted, iv } = await encryptToken(
      accessToken,
      env.ENCRYPTION_SECRET
    );
    
    // Step 4: Create or update user in database
    const user = await upsertUser(db, {
      githubId: githubUser.githubId,
      username: githubUser.username,
      email: githubUser.email,
      avatarUrl: githubUser.avatarUrl,
      githubTokenEncrypted: encrypted,
      githubTokenIv: iv,
    });
    
    // Step 5: Create session (returns with Date objects)
    const session = await createUserSession(db, user.id);
    
    // Step 6: Set session cookie (handles both Date and timestamp)
    const cookie = createSessionCookie(session.id, session.expiresAt);
    
    // Step 7: Redirect to dashboard
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${url.origin}/dashboard`,
        "Set-Cookie": cookie,
      },
    });
  } catch (error) {
    console.error("Callback error:", error);
    
    // Redirect to home with error
    const url = new URL(request.url);
    return Response.redirect(`${url.origin}/?error=auth_failed`);
  }
}
