// src/lib/github/index.js
// Export all GitHub API functions from a single entry point

export { githubRequest, githubGraphQL } from "./client";
export { fetchUserRepos, fetchRepoDetails } from "./graphql";
export {
  createRepository,
  uploadFile,
  uploadMultipleFiles,
  repositoryExists,
  deleteRepository,
} from "./repository";
export {
  getRepoPublicKey,
  setRepoSecret,
  deleteRepoSecret,
  getRepoVariable,
  setRepoVariable,
} from "./secrets";
export {
  checkWorkflowExists,
  getWorkflowTemplate,
  commitWorkflowFile,
  getWorkflowRuns,
  getWorkflowRun,
  getWorkflowJobs,
  getJobLogs,
  getCommitDetails,
} from "./workflow";
