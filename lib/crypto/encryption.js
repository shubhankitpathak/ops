// src/lib/crypto/encryption.js

/**
 * Encrypts GitHub access tokens using AES-GCM
 * Stores encrypted token + IV separately in database
 */

/**
 * Derive encryption key from secret using PBKDF2
 * @param {string} secret - Base secret from environment
 * @returns {Promise<CryptoKey>} Derived encryption key
 */
async function deriveKey(secret) {
  // Convert secret to bytes
  const encoder = new TextEncoder();
  const secretBytes = encoder.encode(secret);
  
  // Import as raw key material
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    secretBytes,
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );
  
  // Derive AES key using PBKDF2 (100k iterations for security)
  const salt = encoder.encode("ops-platform-salt-v1"); // Static salt is OK for key derivation
  
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypt a token using AES-GCM
 * @param {string} token - Plain text token to encrypt
 * @param {string} secret - Encryption secret from environment
 * @returns {Promise<{encrypted: string, iv: string}>} Base64 encrypted data and IV
 */
export async function encryptToken(token, secret) {
  if (!token || !secret) {
    throw new Error("Token and secret are required for encryption");
  }
  
  // Generate random IV (initialization vector) - 12 bytes for GCM
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  // Derive encryption key
  const key = await deriveKey(secret);
  
  // Encrypt the token
  const encoder = new TextEncoder();
  const tokenBytes = encoder.encode(token);
  
  const encryptedBytes = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    tokenBytes
  );
  
  // Convert to base64 for storage
  const encryptedArray = new Uint8Array(encryptedBytes);
  const encryptedBase64 = btoa(String.fromCharCode(...encryptedArray));
  const ivBase64 = btoa(String.fromCharCode(...iv));
  
  return {
    encrypted: encryptedBase64,
    iv: ivBase64,
  };
}

/**
 * Decrypt a token using AES-GCM
 * @param {string} encryptedBase64 - Base64 encrypted token
 * @param {string} ivBase64 - Base64 initialization vector
 * @param {string} secret - Encryption secret from environment
 * @returns {Promise<string>} Decrypted plain text token
 */
export async function decryptToken(encryptedBase64, ivBase64, secret) {
  if (!encryptedBase64 || !ivBase64 || !secret) {
    throw new Error("Encrypted token, IV, and secret are required for decryption");
  }
  
  // Convert from base64
  const encryptedBytes = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
  const iv = Uint8Array.from(atob(ivBase64), c => c.charCodeAt(0));
  
  // Derive the same key
  const key = await deriveKey(secret);
  
  // Decrypt
  const decryptedBytes = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    encryptedBytes
  );
  
  // Convert back to string
  const decoder = new TextDecoder();
  return decoder.decode(decryptedBytes);
}

/**
 * Test encryption/decryption
 * @returns {Promise<boolean>} True if test passes
 */
export async function testEncryption() {
  const testToken = "ghp_test123456789";
  const testSecret = "test-secret-key-32-characters!!";
  
  const { encrypted, iv } = await encryptToken(testToken, testSecret);
  const decrypted = await decryptToken(encrypted, iv, testSecret);
  
  return decrypted === testToken;
}
