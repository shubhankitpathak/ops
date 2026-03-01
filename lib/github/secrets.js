// src/lib/github/secrets.js
import { githubRequest } from "./client";
import { encryptSecretForGitHub } from "@/lib/crypto/github-secrets";

/**
 * Get repository's public key for encrypting secrets
 * @param {string} token - GitHub access token
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @returns {Promise<Object>} { key, key_id }
 */
export async function getRepoPublicKey(token, owner, repo) {
  const { data, rateLimit } = await githubRequest(
    `/repos/${owner}/${repo}/actions/secrets/public-key`,
    token
  );
  
  return {
    key: data.key,
    keyId: data.key_id,
    rateLimit,
  };
}

/**
 * Set a repository secret
 * @param {string} token - GitHub access token
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} secretName - Name of the secret
 * @param {string} secretValue - Value to encrypt and store
 * @returns {Promise<Object>} Result
 */
export async function setRepoSecret(token, owner, repo, secretName, secretValue) {
  // First get the public key
  const { key, keyId } = await getRepoPublicKey(token, owner, repo);
  
  // Encrypt the secret value
  const encryptedValue = encryptSecretForGitHub(key, secretValue);
  
  // Set the secret
  const { rateLimit } = await githubRequest(
    `/repos/${owner}/${repo}/actions/secrets/${secretName}`,
    token,
    {
      method: "PUT",
      body: JSON.stringify({
        encrypted_value: encryptedValue,
        key_id: keyId,
      }),
    }
  );
  
  return { success: true, rateLimit };
}

/**
 * Delete a repository secret
 * @param {string} token - GitHub access token
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} secretName - Name of the secret
 */
export async function deleteRepoSecret(token, owner, repo, secretName) {
  const { rateLimit } = await githubRequest(
    `/repos/${owner}/${repo}/actions/secrets/${secretName}`,
    token,
    { method: "DELETE" }
  );
  
  return { success: true, rateLimit };
}

/**
 * Get a repository variable
 * @param {string} token - GitHub access token
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} variableName - Name of the variable
 * @returns {Promise<Object|null>} Variable data or null if not found
 */
export async function getRepoVariable(token, owner, repo, variableName) {
  try {
    const { data, rateLimit } = await githubRequest(
      `/repos/${owner}/${repo}/actions/variables/${variableName}`,
      token
    );
    return { variable: data, rateLimit };
  } catch (error) {
    if (error.message.includes("404")) {
      return { variable: null, rateLimit: null };
    }
    throw error;
  }
}

/**
 * Set a repository variable (create or update)
 * @param {string} token - GitHub access token
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} variableName - Name of the variable
 * @param {string} value - Variable value
 */
export async function setRepoVariable(token, owner, repo, variableName, value) {
  // Check if variable exists
  const { variable } = await getRepoVariable(token, owner, repo, variableName);
  
  if (variable) {
    // Update existing variable
    const { rateLimit } = await githubRequest(
      `/repos/${owner}/${repo}/actions/variables/${variableName}`,
      token,
      {
        method: "PATCH",
        body: JSON.stringify({ value }),
      }
    );
    return { success: true, action: "updated", rateLimit };
  } else {
    // Create new variable
    const { rateLimit } = await githubRequest(
      `/repos/${owner}/${repo}/actions/variables`,
      token,
      {
        method: "POST",
        body: JSON.stringify({ name: variableName, value }),
      }
    );
    return { success: true, action: "created", rateLimit };
  }
}
