// src/lib/auth/session.js
import { generateId, createSession, findValidSession, deleteSession } from "@/lib/db/helpers";

/**
 * Session cookie name
 */
export const SESSION_COOKIE_NAME = "ops_session";

/**
 * Session duration in days
 */
export const SESSION_DURATION_DAYS = 7;

/**
 * Cookie options for secure session management
 */
export function getSessionCookieOptions(expiresAt) {
  // Ensure expiresAt is a Date object
  const expiresDate = expiresAt instanceof Date ? expiresAt : new Date(expiresAt * 1000);
  
  return {
    httpOnly: true,      // Prevents JavaScript access (XSS protection)
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
    sameSite: "lax",     // CSRF protection
    path: "/",           // Available site-wide
    expires: expiresDate,  // Cookie expiration
  };
}

/**
 * Create a new session for a user
 * @param {Object} db - Database instance
 * @param {string} userId - User ID to create session for
 * @returns {Promise<Object>} Session object with id and expiresAt (as Date)
 */
export async function createUserSession(db, userId) {
  return createSession(db, userId, SESSION_DURATION_DAYS);
}

/**
 * Get session from request cookies
 * @param {Request} request - Incoming request
 * @returns {string|null} Session ID or null
 */
export function getSessionFromRequest(request) {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;
  
  const cookies = Object.fromEntries(
    cookieHeader.split("; ").map(c => {
      const [key, ...v] = c.split("=");
      return [key, v.join("=")];
    })
  );
  
  return cookies[SESSION_COOKIE_NAME] || null;
}

/**
 * Validate session and get user ID
 * @param {Object} db - Database instance
 * @param {string} sessionId - Session ID from cookie
 * @returns {Promise<string|null>} User ID or null if invalid
 */
export async function validateSession(db, sessionId) {
  if (!sessionId) return null;
  
  const session = await findValidSession(db, sessionId);
  return session ? session.userId : null;
}

/**
 * Clear session (logout)
 * @param {Object} db - Database instance
 * @param {string} sessionId - Session ID to clear
 */
export async function clearSession(db, sessionId) {
  if (sessionId) {
    await deleteSession(db, sessionId);
  }
}

/**
 * Set session cookie in response
 * @param {string} sessionId - Session ID to set
 * @param {Date|number} expiresAt - Expiration date or Unix timestamp
 * @returns {string} Set-Cookie header value
 */
export function createSessionCookie(sessionId, expiresAt) {
  // Convert timestamp to Date if needed
  const expiresDate = expiresAt instanceof Date ? expiresAt : new Date(expiresAt * 1000);
  
  const options = getSessionCookieOptions(expiresDate);
  
  let cookie = `${SESSION_COOKIE_NAME}=${sessionId}`;
  cookie += `; Path=${options.path}`;
  cookie += `; Expires=${expiresDate.toUTCString()}`;
  cookie += `; SameSite=${options.sameSite}`;
  
  if (options.httpOnly) cookie += "; HttpOnly";
  if (options.secure) cookie += "; Secure";
  
  return cookie;
}

/**
 * Clear session cookie (for logout)
 * @returns {string} Set-Cookie header value to clear cookie
 */
export function clearSessionCookie() {
  return `${SESSION_COOKIE_NAME}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=lax`;
}
