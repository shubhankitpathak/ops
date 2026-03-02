// src/lib/cache/repos.js
import { CACHE_CONFIG, getReposCacheKey } from "./config";
import { createCacheManager } from "./manager";

/**
 * Get user's repositories with caching
 * @param {Object} db - Database instance
 * @param {string} userId - User ID
 * @param {Function} fetchFn - Function to fetch repos from GitHub
 * @returns {Promise<Object>} { data, fromCache }
 */
export async function getCachedRepos(db, userId, fetchFn) {
  const cache = createCacheManager(db);
  const key = getReposCacheKey(userId);
  
  return cache.getOrFetch(key, fetchFn, CACHE_CONFIG.REPOS.ttl);
}

/**
 * Invalidate user's repositories cache
 * Call this when user creates a new project or repo changes
 * @param {Object} db - Database instance
 * @param {string} userId - User ID
 */
export async function invalidateReposCache(db, userId) {
  const cache = createCacheManager(db);
  const key = getReposCacheKey(userId);
  await cache.delete(key);
}
