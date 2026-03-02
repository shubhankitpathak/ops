// src/app/api/test-crypto/route.js
import { encryptToken, decryptToken, testEncryption } from "@/lib/crypto/encryption";
import { testGitHubEncryption } from "@/lib/crypto/github-secrets";
import { getEnv } from "@/lib/cloudflare/env";

export async function GET() {
  try {
    const env = await getEnv();
    
    const tests = {
      aes_gcm: false,
      github_secrets: false,
      full_cycle: false,
    };
    
    // Test 1: AES-GCM basic test
    tests.aes_gcm = await testEncryption();
    
    // Test 2: GitHub secrets encryption
    tests.github_secrets = testGitHubEncryption();
    
    // Test 3: Full encryption cycle with real secret
    if (env.ENCRYPTION_SECRET) {
      try {
        const testToken = "ghp_test_token_123456789";
        const { encrypted, iv } = await encryptToken(testToken, env.ENCRYPTION_SECRET);
        const decrypted = await decryptToken(encrypted, iv, env.ENCRYPTION_SECRET);
        tests.full_cycle = decrypted === testToken;
      } catch (error) {
        tests.full_cycle = `error: ${error.message}`;
      }
    } else {
      tests.full_cycle = "ENCRYPTION_SECRET not set";
    }
    
    const allPassed = Object.values(tests).every(v => v === true);
    
    return Response.json({
      status: allPassed ? "all_tests_passed" : "some_tests_failed",
      tests,
    });
  } catch (error) {
    return Response.json(
      {
        status: "error",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
