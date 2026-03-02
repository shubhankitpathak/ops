// src/lib/cloudflare/env-vars.js
import { cfRequest } from "./client";

/**
 * Set environment variables in Cloudflare Pages project
 * @param {string} accountId - Cloudflare account ID
 * @param {string} apiToken - Cloudflare API token
 * @param {string} projectName - Pages project name
 * @param {Array} envVars - Array of { key, value }
 * @param {string} environment - "production" or "preview"
 */
export async function setPagesEnvVars(accountId, apiToken, projectName, envVars, environment = "production") {
  if (!envVars || envVars.length === 0) return;
  
  // Build env vars object for Cloudflare API
  const envVarsObj = {};
  for (const { key, value } of envVars) {
    envVarsObj[key] = {
      type: "secret_text",
      value: value,
    };
  }
  
  // Update project with env vars
  await cfRequest(
    accountId,
    apiToken,
    `/pages/projects/${projectName}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        deployment_configs: {
          [environment]: {
            env_vars: envVarsObj,
          },
        },
      }),
    }
  );
}

/**
 * Get environment variables from Cloudflare Pages project
 */
export async function getPagesEnvVars(accountId, apiToken, projectName) {
  const project = await cfRequest(
    accountId,
    apiToken,
    `/pages/projects/${projectName}`
  );
  
  return {
    production: project.deployment_configs?.production?.env_vars || {},
    preview: project.deployment_configs?.preview?.env_vars || {},
  };
}

/**
 * Delete environment variable from Cloudflare Pages project
 */
export async function deletePagesEnvVar(accountId, apiToken, projectName, key, environment = "production") {
  const currentVars = await getPagesEnvVars(accountId, apiToken, projectName);
  const envVars = currentVars[environment];
  
  // Remove the key
  delete envVars[key];
  
  // Update with remaining vars
  await cfRequest(
    accountId,
    apiToken,
    `/pages/projects/${projectName}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        deployment_configs: {
          [environment]: {
            env_vars: envVars,
          },
        },
      }),
    }
  );
}
