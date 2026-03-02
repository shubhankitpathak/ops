// app/api/test-analytics/route.js
import { getEnv } from "@/lib/cloudflare/env";

/**
 * GET /api/test-analytics
 * Test endpoint to verify Cloudflare Analytics API access
 */
export async function GET(request) {
  try {
    const env = await getEnv();
    
    if (!env.CF_API_TOKEN || !env.CF_ACCOUNT_ID) {
      return Response.json({
        success: false,
        error: "Missing Cloudflare credentials",
        details: {
          hasToken: !!env.CF_API_TOKEN,
          hasAccountId: !!env.CF_ACCOUNT_ID,
        },
        fix: "Set CF_API_TOKEN and CF_ACCOUNT_ID in your .dev.vars file",
      }, { status: 400 });
    }
    
    // Test GraphQL Analytics API
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const nowDate = now.toISOString().split('T')[0];
    const sinceDate = sevenDaysAgo.toISOString().split('T')[0];
    
    const query = `
      query {
        viewer {
          accounts(filter: { accountTag: "${env.CF_ACCOUNT_ID}" }) {
            httpRequests1dGroups(
              limit: 7
              filter: {
                date_geq: "${sinceDate}"
                date_leq: "${nowDate}"
              }
            ) {
              dimensions {
                date
              }
              sum {
                requests
                bytes
              }
            }
          }
        }
      }
    `;
    
    const response = await fetch("https://api.cloudflare.com/client/v4/graphql", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.CF_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return Response.json({
        success: false,
        error: "Cloudflare API request failed",
        status: response.status,
        statusText: response.statusText,
        data: data,
        fix: response.status === 401 
          ? "Your API token doesn't have Analytics permissions. Update at: https://dash.cloudflare.com/profile/api-tokens"
          : "Check your Cloudflare API token and account ID",
      }, { status: response.status });
    }
    
    if (data.errors) {
      return Response.json({
        success: false,
        error: "GraphQL query error",
        details: data.errors,
        fix: data.errors[0]?.message?.includes("Authentication") 
          ? "Add 'Account → Analytics → Read' permission to your API token at: https://dash.cloudflare.com/profile/api-tokens"
          : "Check the GraphQL query syntax",
      }, { status: 400 });
    }
    
    const analyticsData = data.data?.viewer?.accounts?.[0]?.httpRequests1dGroups || [];
    
    return Response.json({
      success: true,
      message: "✅ Cloudflare Analytics API is working!",
      accountId: env.CF_ACCOUNT_ID,
      tokenValid: true,
      analyticsEnabled: true,
      sampleData: analyticsData.length > 0 ? analyticsData[0] : null,
      dataPoints: analyticsData.length,
      note: analyticsData.length === 0 
        ? "No analytics data yet. Data will appear once your Pages projects receive traffic."
        : "Analytics data found! Your setup is working correctly.",
    });
  } catch (error) {
    return Response.json({
      success: false,
      error: error.message,
      details: error.toString(),
    }, { status: 500 });
  }
}
