// src/lib/auth/github.js

/**
 * GitHub OAuth configuration and API helpers
 */

/**
 * Get GitHub OAuth authorization URL
 * @param {string} clientId - GitHub OAuth app client ID
 * @param {string} redirectUri - Callback URL
 * @returns {string} Authorization URL
 */
export function getGitHubAuthUrl(clientId, redirectUri) {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "public_repo workflow", // Permissions needed
    state: crypto.randomUUID(), // CSRF protection
  });
  
  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 * @param {string} code - Authorization code from GitHub
 * @param {string} clientId - GitHub OAuth app client ID
 * @param {string} clientSecret - GitHub OAuth app client secret
 * @returns {Promise<string>} Access token
 */
export async function exchangeCodeForToken(code, clientId, clientSecret) {
  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to exchange code: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  if (data.error) {
    throw new Error(`GitHub OAuth error: ${data.error_description || data.error}`);
  }
  
  return data.access_token;
}

/**
 * Get authenticated user info from GitHub
 * @param {string} accessToken - GitHub access token
 * @returns {Promise<Object>} User data
 */
export async function getGitHubUser(accessToken) {
  const response = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github.v3+json",
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch user: ${response.statusText}`);
  }
  
  const user = await response.json();
  
  return {
    githubId: user.id.toString(),
    username: user.login,
    email: user.email,
    avatarUrl: user.avatar_url,
    name: user.name,
    bio: user.bio,
  };
}
