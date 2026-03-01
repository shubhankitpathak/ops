// src/app/api/auth/login/route.js
import { getEnv } from "@/lib/cloudflare/env";
import { getGitHubAuthUrl } from "@/lib/auth/github";

export async function GET(request) {
  try {
    const env = await getEnv();
    
    // Check if GitHub OAuth is configured
    if (!env.GITHUB_CLIENT_ID) {
      return Response.json(
        { error: "GitHub OAuth not configured" },
        { status: 500 }
      );
    }
    
    // Get the callback URL
    const url = new URL(request.url);
    const redirectUri = `${url.origin}/api/auth/callback`;
    
    // Generate GitHub authorization URL
    const authUrl = getGitHubAuthUrl(env.GITHUB_CLIENT_ID, redirectUri);
    
    // Redirect to GitHub
    return Response.redirect(authUrl);
  } catch (error) {
    console.error("Login error:", error);
    return Response.json(
      { error: "Failed to initialize login" },
      { status: 500 }
    );
  }
}
