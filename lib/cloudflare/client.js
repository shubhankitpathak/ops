// src/lib/cloudflare/client.js

const CF_API_BASE = "https://api.cloudflare.com/client/v4";

/**
 * Make authenticated Cloudflare API request
 * @param {string} accountId - Cloudflare account ID
 * @param {string} apiToken - Cloudflare API token
 * @param {string} endpoint - API endpoint starting with /
 * @param {Object} options - Fetch options
 */
export async function cfRequest(accountId, apiToken, endpoint, options = {}) {
  const url = `${CF_API_BASE}/accounts/${accountId}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  
  const json = await response.json().catch(() => null);
  
  if (!response.ok || !json?.success) {
    const message = json?.errors?.[0]?.message || response.statusText;
    throw new Error(`Cloudflare API error: ${response.status} - ${message}`);
  }
  
  return json.result;
}
