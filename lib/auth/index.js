// src/lib/auth/index.js
import { getEnv } from "@/lib/cloudflare/env";
import { getDB, findUserById } from "@/lib/db";
import { getSessionFromRequest, validateSession } from "./session";

/**
 * Get current authenticated user from request
 * @param {Request} request - Incoming request
 * @returns {Promise<Object|null>} User object or null
 */
export async function getCurrentUser(request) {
  try {
    const env = await getEnv();
    const db = getDB(env);
    
    // Get session from cookie
    const sessionId = getSessionFromRequest(request);
    if (!sessionId) return null;
    
    // Validate session and get user ID
    const userId = await validateSession(db, sessionId);
    if (!userId) return null;
    
    // Fetch user details
    const user = await findUserById(db, userId);
    return user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

/**
 * Require authentication - throws if not authenticated
 * @param {Request} request - Incoming request
 * @returns {Promise<Object>} User object
 * @throws {Error} If not authenticated
 */
export async function requireAuth(request) {
  const user = await getCurrentUser(request);
  
  if (!user) {
    throw new Error("Authentication required");
  }
  
  return user;
}

/**
 * Check if request is authenticated
 * @param {Request} request - Incoming request
 * @returns {Promise<boolean>} True if authenticated
 */
export async function isAuthenticated(request) {
  const user = await getCurrentUser(request);
  return !!user;
}
