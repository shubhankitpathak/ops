// src/lib/cloudflare/env.js
import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Get Cloudflare environment bindings
 * Works in both development and production
 * @returns {Promise<Object>} Environment with DB and secrets
 */
export async function getEnv() {
  const { env } = await getCloudflareContext();
  return env;
}

/**
 * Get specific environment variable
 * @param {string} key - Environment variable name
 * @returns {Promise<string|undefined>}
 */
export async function getEnvVar(key) {
  const env = await getEnv();
  return env[key];
}
