// src/lib/cache/deployments.js
import { CACHE_CONFIG, getDeploymentsCacheKey } from "./config";
import { createCacheManager } from "./manager";

/**
 * Get project deployments with caching
 * @param {Object} db - Database instance
 * @param {string} projectId - Project ID
 * @param {Function} fetchFn - Function to fetch deployments from GitHub
 * @returns {Promise<Object>} { data, fromCache }
 */
export async function getCachedDeployments(db, projectId, fetchFn) {
  const cache = createCacheManager(db);
  const key = getDeploymentsCacheKey(projectId);
  
  return cache.getOrFetch(key, fetchFn, CACHE_CONFIG.DEPLOYMENTS.ttl);
}

/**
 * Invalidate project deployments cache
 * Call this when a new deployment is triggered
 * @param {Object} db - Database instance
 * @param {string} projectId - Project ID
 */
export async function invalidateDeploymentsCache(db, projectId) {
  const cache = createCacheManager(db);
  const key = getDeploymentsCacheKey(projectId);
  await cache.delete(key);
}

/**
 * Check if deployment is in terminal state (completed/failed)
 * If so, we can cache longer
 * @param {Object} deployment - Deployment object with status
 * @returns {boolean}
 */
export function isTerminalState(deployment) {
  return deployment.conclusion !== null && 
         (deployment.conclusion === "success" || 
          deployment.conclusion === "failure" ||
          deployment.conclusion === "cancelled");
}
