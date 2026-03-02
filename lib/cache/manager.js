// src/lib/cache/manager.js
import { getCache, setCache, deleteCache } from "@/lib/db/helpers";
import { CACHE_CONFIG } from "./config";

/**
 * Generic cache manager with typed operations
 */
export class CacheManager {
  constructor(db) {
    this.db = db;
  }
  
  /**
   * Get cached data
   * @param {string} key - Cache key
   * @returns {Promise<any|null>} Cached data or null if not found/expired
   */
  async get(key) {
    try {
      return await getCache(this.db, key);
    } catch (error) {
      console.error(`Cache get error for ${key}:`, error);
      return null;
    }
  }
  
  /**
   * Set cached data
   * @param {string} key - Cache key
   * @param {any} value - Data to cache
   * @param {number} ttl - Time to live in seconds
   */
  async set(key, value, ttl) {
    try {
      await setCache(this.db, key, value, ttl);
    } catch (error) {
      console.error(`Cache set error for ${key}:`, error);
    }
  }
  
  /**
   * Delete cached data
   * @param {string} key - Cache key
   */
  async delete(key) {
    try {
      await deleteCache(this.db, key);
    } catch (error) {
      console.error(`Cache delete error for ${key}:`, error);
    }
  }
  
  /**
   * Get or fetch pattern: try cache first, fetch if missing, then cache result
   * @param {string} key - Cache key
   * @param {Function} fetchFn - Async function to fetch data if not cached
   * @param {number} ttl - Time to live in seconds
   * @returns {Promise<any>}
   */
  async getOrFetch(key, fetchFn, ttl) {
    // Try to get from cache first
    const cached = await this.get(key);
    if (cached !== null) {
      return { data: cached, fromCache: true };
    }
    
    // Cache miss - fetch fresh data
    const fresh = await fetchFn();
    
    // Cache the result
    await this.set(key, fresh, ttl);
    
    return { data: fresh, fromCache: false };
  }
}

/**
 * Create cache manager instance
 * @param {Object} db - Database instance
 * @returns {CacheManager}
 */
export function createCacheManager(db) {
  return new CacheManager(db);
}
