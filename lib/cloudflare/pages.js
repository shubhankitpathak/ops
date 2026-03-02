// src/lib/cloudflare/pages.js
import { cfRequest } from "./client";

/**
 * Generate a safe Pages project name
 */
export function generatePagesProjectName(repoName) {
  const clean = repoName
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  
  const random = Math.random().toString(36).slice(2, 8);
  return `ops-${clean}-${random}`.slice(0, 58);
}

/**
 * Create a Direct Upload Pages project
 * Using minimal required fields for Direct Upload
 */
export async function createPagesProject(accountId, apiToken, projectName, productionBranch = "main") {
  const body = {
    name: projectName,
    production_branch: productionBranch,
  };
  
  console.log("Creating Pages project with body:", JSON.stringify(body, null, 2));
  
  const result = await cfRequest(
    accountId,
    apiToken,
    "/pages/projects",
    {
      method: "POST",
      body: JSON.stringify(body),
    }
  );
  
  return {
    name: result.name,
    subdomain: result.subdomain,
    productionBranch: result.production_branch,
    createdOn: result.created_on,
  };
}

/**
 * Get existing Pages project
 */
export async function getPagesProject(accountId, apiToken, projectName) {
  try {
    const result = await cfRequest(
      accountId,
      apiToken,
      `/pages/projects/${projectName}`
    );
    
    return {
      name: result.name,
      subdomain: result.subdomain,
      productionBranch: result.production_branch,
    };
  } catch (error) {
    if (error.message.includes("404")) {
      return null;
    }
    throw error;
  }
}

/**
 * List all Pages projects
 */
export async function listPagesProjects(accountId, apiToken) {
  const result = await cfRequest(
    accountId,
    apiToken,
    "/pages/projects"
  );
  
  return result.map(p => ({
    name: p.name,
    subdomain: p.subdomain,
    productionBranch: p.production_branch,
    createdOn: p.created_on,
  }));
}

/**
 * Delete Pages project
 */
export async function deletePagesProject(accountId, apiToken, projectName) {
  await cfRequest(
    accountId,
    apiToken,
    `/pages/projects/${projectName}`,
    { method: "DELETE" }
  );
  
  return { success: true };
}

/**
 * Get all deployments for a Pages project
 */
export async function getPagesDeployments(accountId, apiToken, projectName) {
  try {
    const result = await cfRequest(
      accountId,
      apiToken,
      `/pages/projects/${projectName}/deployments`
    );
    
    return result.map(d => ({
      id: d.id,
      shortId: d.short_id,
      url: d.url,
      environment: d.environment,
      createdOn: d.created_on,
      latestStage: d.latest_stage,
      projectName: d.project_name,
      deploymentTrigger: d.deployment_trigger,
      stages: d.stages,
      buildConfig: d.build_config,
      source: d.source,
      aliases: d.aliases,
    }));
  } catch (error) {
    console.error("Error fetching Pages deployments:", error);
    return [];
  }
}

/**
 * Promote a deployment to production (rollback feature)
 */
export async function promoteDeployment(accountId, apiToken, projectName, deploymentId) {
  const result = await cfRequest(
    accountId,
    apiToken,
    `/pages/projects/${projectName}/deployments/${deploymentId}/rollback`,
    { method: "POST" }
  );
  
  return {
    id: result.id,
    url: result.url,
    environment: result.environment,
  };
}
