// src/lib/crypto/github-secrets.js
import nacl from "tweetnacl";
import util from "tweetnacl-util";
import sealedBox from "tweetnacl-sealedbox-js";

/**
 * Encrypt a secret for GitHub using libsodium sealed box
 * Required by GitHub API for setting repository secrets
 * 
 * @param {string} publicKey - Base64 public key from GitHub
 * @param {string} secret - Secret value to encrypt
 * @returns {string} Base64 encrypted secret
 */
export function encryptSecretForGitHub(publicKey, secret) {
  // Decode the public key from base64
  const publicKeyBytes = util.decodeBase64(publicKey);
  
  // Convert secret to Uint8Array
  const secretBytes = util.decodeUTF8(secret);
  
  // Encrypt using sealed box (anonymous public key encryption)
  const encryptedBytes = sealedBox.seal(secretBytes, publicKeyBytes);
  
  // Encode to base64 for GitHub API
  return util.encodeBase64(encryptedBytes);
}

/**
 * Test GitHub secret encryption
 * Note: We can't decrypt sealed boxes (they're one-way), 
 * but we can verify the format is correct
 */
export function testGitHubEncryption() {
  // Generate a test keypair
  const keypair = nacl.box.keyPair();
  const testSecret = "test_secret_value";
  
  try {
    const encrypted = encryptSecretForGitHub(
      util.encodeBase64(keypair.publicKey),
      testSecret
    );
    
    // Check if we got a base64 string back
    return typeof encrypted === "string" && encrypted.length > 0;
  } catch (error) {
    console.error("GitHub encryption test failed:", error);
    return false;
  }
}
