// src/lib/auth/token.js
import { decryptToken } from "@/lib/crypto/encryption";
import { findUserById } from "@/lib/db/helpers";

/**
 * Get decrypted GitHub token for a user
 * @param {Object} db - Database instance
 * @param {string} userId - User ID
 * @param {string} encryptionSecret - Encryption secret from environment
 * @returns {Promise<string>} Decrypted GitHub token
 */
export async function getUserGitHubToken(db, userId, encryptionSecret) {
  const user = await findUserById(db, userId);
  
  if (!user) {
    throw new Error("User not found");
  }
  
  if (!user.githubTokenEncrypted || !user.githubTokenIv) {
    throw new Error("User has no GitHub token");
  }
  
  const token = await decryptToken(
    user.githubTokenEncrypted,
    user.githubTokenIv,
    encryptionSecret
  );
  
  return token;
}
