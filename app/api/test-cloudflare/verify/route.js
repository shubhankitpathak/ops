// src/app/api/test-cloudflare/verify/route.js
import { getEnv } from "@/lib/cloudflare/env";

export async function GET() {
  try {
    const env = await getEnv();
    
    if (!env.CF_ACCOUNT_ID || !env.CF_API_TOKEN) {
      return Response.json({
        error: "Missing credentials",
        has_account_id: !!env.CF_ACCOUNT_ID,
        has_api_token: !!env.CF_API_TOKEN,
      }, { status: 400 });
    }
    
    // Test 1: Verify token works by listing existing Pages projects
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/pages/projects`,
      {
        headers: {
          Authorization: `Bearer ${env.CF_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    
    const data = await response.json();
    
    return Response.json({
      status: response.status,
      success: data.success,
      result: {
        projects_count: data.result?.length || 0,
        projects: data.result?.slice(0, 3).map(p => ({
          name: p.name,
          subdomain: p.subdomain,
        })) || [],
      },
      errors: data.errors || [],
    });
  } catch (error) {
    return Response.json({
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
