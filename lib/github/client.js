// src/lib/github/client.js

const GITHUB_API_BASE = "https://api.github.com";
const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";

/**
 * Make authenticated GitHub REST API request
 * @param {string} endpoint - API endpoint (without base URL)
 * @param {string} token - GitHub access token
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} API response
 */
export async function githubRequest(endpoint, token, options = {}) {
  const url = endpoint.startsWith("http") ? endpoint : `${GITHUB_API_BASE}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  
  // Extract rate limit info
  const rateLimit = {
    limit: parseInt(response.headers.get("X-RateLimit-Limit") || "5000"),
    remaining: parseInt(response.headers.get("X-RateLimit-Remaining") || "5000"),
    reset: parseInt(response.headers.get("X-RateLimit-Reset") || "0"),
  };
  
  // Handle rate limiting
  if (response.status === 403 && rateLimit.remaining === 0) {
    const resetTime = new Date(rateLimit.reset * 1000);
    throw new Error(`GitHub rate limit exceeded. Resets at ${resetTime.toISOString()}`);
  }
  
  // Handle errors
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      `GitHub API error: ${response.status} - ${error.message || response.statusText}`
    );
  }
  
  // Return empty for 204 No Content
  if (response.status === 204) {
    return { data: null, rateLimit };
  }
  
  const data = await response.json();
  return { data, rateLimit };
}

/**
 * Make authenticated GitHub GraphQL request
 * @param {string} query - GraphQL query
 * @param {Object} variables - Query variables
 * @param {string} token - GitHub access token
 * @returns {Promise<Object>} GraphQL response
 */
export async function githubGraphQL(query, variables, token) {
  const response = await fetch(GITHUB_GRAPHQL_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });
  
  // Extract rate limit info
  const rateLimit = {
    limit: parseInt(response.headers.get("X-RateLimit-Limit") || "5000"),
    remaining: parseInt(response.headers.get("X-RateLimit-Remaining") || "5000"),
    reset: parseInt(response.headers.get("X-RateLimit-Reset") || "0"),
  };
  
  if (!response.ok) {
    throw new Error(`GitHub GraphQL error: ${response.status} - ${response.statusText}`);
  }
  
  const result = await response.json();
  
  if (result.errors) {
    throw new Error(`GitHub GraphQL error: ${result.errors[0].message}`);
  }
  
  return { data: result.data, rateLimit };
}
