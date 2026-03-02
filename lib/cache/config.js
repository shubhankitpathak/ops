// src/lib/cache/config.js

/**
 * Cache configuration with TTL (time-to-live) in seconds
 */
export const CACHE_CONFIG = {
  // User's GitHub repositories - 5 minutes
  REPOS: {
    key: (userId) => `repos:${userId}`,
    ttl: 300, // 5 minutes
  },
  
  // Deployment status for a project - 30 seconds
  DEPLOYMENTS: {
    key: (projectId) => `deployments:${projectId}`,
    ttl: 30, // 30 seconds
  },
  
  // GitHub rate limit info - 1 minute
  RATE_LIMIT: {
    key: (userId) => `rate_limit:${userId}`,
    ttl: 60, // 1 minute
  },
  
  // Repository details - 10 minutes
  REPO_DETAILS: {
    key: (owner, repo) => `repo:${owner}/${repo}`,
    ttl: 600, // 10 minutes
  },
};

/**
 * Get cache key for repos
 */
export function getReposCacheKey(userId) {
  return CACHE_CONFIG.REPOS.key(userId);
}

/**
 * Get cache key for deployments
 */
export function getDeploymentsCacheKey(projectId) {
  return CACHE_CONFIG.DEPLOYMENTS.key(projectId);
}

/**
 * Get cache key for rate limit
 */
export function getRateLimitCacheKey(userId) {
  return CACHE_CONFIG.RATE_LIMIT.key(userId);
}

/**
 * Get cache key for repo details
 */
export function getRepoDetailsCacheKey(owner, repo) {
  return CACHE_CONFIG.REPO_DETAILS.key(owner, repo);
}
