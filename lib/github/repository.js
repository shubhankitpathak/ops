// lib/github/repository.js
import { githubRequest } from "./client";

/**
 * Create a new GitHub repository
 * @param {string} token - GitHub access token
 * @param {object} repoConfig - Repository configuration
 * @returns {Promise<object>} Created repository data
 */
export async function createRepository(token, repoConfig) {
  const {
    name,
    description = "",
    isPrivate = false,
    autoInit = true, // Automatically initialize with README
  } = repoConfig;
  
  const body = {
    name,
    description,
    private: isPrivate,
    auto_init: autoInit,
  };
  
  const { data } = await githubRequest("/user/repos", token, {
    method: "POST",
    body: JSON.stringify(body),
  });
  
  return {
    name: data.name,
    fullName: data.full_name,
    owner: data.owner.login,
    defaultBranch: data.default_branch || "main",
    htmlUrl: data.html_url,
    cloneUrl: data.clone_url,
    createdAt: data.created_at,
  };
}

/**
 * Upload a single file to GitHub repository
 * @param {string} token - GitHub access token
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} path - File path in repository
 * @param {string} content - File content (will be base64 encoded)
 * @param {string} message - Commit message
 * @param {string} branch - Branch name (default: main)
 */
export async function uploadFile(token, owner, repo, path, content, message, branch = "main") {
  // Encode content to base64
  const base64Content = Buffer.from(content).toString('base64');
  
  const body = {
    message,
    content: base64Content,
    branch,
  };
  
  const { data } = await githubRequest(
    `/repos/${owner}/${repo}/contents/${path}`,
    token,
    {
      method: "PUT",
      body: JSON.stringify(body),
    }
  );
  
  return {
    path: data.content.path,
    sha: data.content.sha,
    size: data.content.size,
    url: data.content.html_url,
  };
}

/**
 * Upload multiple files to GitHub repository
 * @param {string} token - GitHub access token
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {Array<{path: string, content: string}>} files - Array of files to upload
 * @param {string} message - Commit message
 * @param {string} branch - Branch name
 */
export async function uploadMultipleFiles(token, owner, repo, files, message, branch = "main") {
  const uploadResults = [];
  
  // Upload files sequentially to avoid rate limiting
  for (const file of files) {
    try {
      const result = await uploadFile(
        token,
        owner,
        repo,
        file.path,
        file.content,
        message,
        branch
      );
      uploadResults.push({ success: true, ...result });
    } catch (error) {
      uploadResults.push({ 
        success: false, 
        path: file.path, 
        error: error.message 
      });
    }
  }
  
  return uploadResults;
}

/**
 * Check if repository exists
 * @param {string} token - GitHub access token
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 */
export async function repositoryExists(token, owner, repo) {
  try {
    await githubRequest(`/repos/${owner}/${repo}`, token);
    return true;
  } catch (error) {
    if (error.message.includes("404")) {
      return false;
    }
    throw error;
  }
}

/**
 * Delete a repository
 * @param {string} token - GitHub access token
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 */
export async function deleteRepository(token, owner, repo) {
  await githubRequest(`/repos/${owner}/${repo}`, token, {
    method: "DELETE",
  });
  
  return { success: true, message: "Repository deleted" };
}
