// src/lib/github/graphql.js
import { githubGraphQL } from "./client";

/**
 * GraphQL query to fetch user's repositories with all needed details
 * This single query replaces 50+ REST API calls!
 */
const GET_USER_REPOS_QUERY = `
  query GetUserRepos($first: Int!, $after: String) {
    viewer {
      repositories(
        first: $first
        after: $after
        orderBy: { field: UPDATED_AT, direction: DESC }
        ownerAffiliations: [OWNER]
      ) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          name
          nameWithOwner
          description
          url
          homepageUrl
          isPrivate
          isFork
          isArchived
          createdAt
          updatedAt
          pushedAt
          defaultBranchRef {
            name
          }
          primaryLanguage {
            name
            color
          }
          languages(first: 5) {
            nodes {
              name
              color
            }
          }
          stargazerCount
          forkCount
          repositoryTopics(first: 5) {
            nodes {
              topic {
                name
              }
            }
          }
        }
      }
    }
  }
`;

/**
 * Fetch all user repositories using GraphQL (paginated)
 * @param {string} token - GitHub access token
 * @param {number} maxRepos - Maximum repos to fetch (default: 100)
 * @returns {Promise<Object>} { repos, rateLimit }
 */
export async function fetchUserRepos(token, maxRepos = 100) {
  const allRepos = [];
  let hasNextPage = true;
  let cursor = null;
  let lastRateLimit = null;
  
  while (hasNextPage && allRepos.length < maxRepos) {
    const { data, rateLimit } = await githubGraphQL(
      GET_USER_REPOS_QUERY,
      { first: Math.min(50, maxRepos - allRepos.length), after: cursor },
      token
    );
    
    lastRateLimit = rateLimit;
    const repos = data.viewer.repositories.nodes;
    const pageInfo = data.viewer.repositories.pageInfo;
    
    // Transform repos to simpler format
    const transformedRepos = repos.map(transformRepo);
    allRepos.push(...transformedRepos);
    
    hasNextPage = pageInfo.hasNextPage;
    cursor = pageInfo.endCursor;
  }
  
  return { repos: allRepos, rateLimit: lastRateLimit };
}

/**
 * Transform GraphQL repo response to simpler format
 */
function transformRepo(repo) {
  const [owner, name] = repo.nameWithOwner.split("/");
  
  return {
    name: repo.name,
    owner,
    fullName: repo.nameWithOwner,
    description: repo.description,
    url: repo.url,
    homepage: repo.homepageUrl,
    isPrivate: repo.isPrivate,
    isFork: repo.isFork,
    isArchived: repo.isArchived,
    defaultBranch: repo.defaultBranchRef?.name || "main",
    language: repo.primaryLanguage?.name || null,
    languageColor: repo.primaryLanguage?.color || null,
    languages: repo.languages.nodes.map(l => ({
      name: l.name,
      color: l.color,
    })),
    stars: repo.stargazerCount,
    forks: repo.forkCount,
    topics: repo.repositoryTopics.nodes.map(t => t.topic.name),
    createdAt: repo.createdAt,
    updatedAt: repo.updatedAt,
    pushedAt: repo.pushedAt,
  };
}

/**
 * Get single repository details
 */
const GET_REPO_QUERY = `
  query GetRepo($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      name
      nameWithOwner
      description
      url
      isPrivate
      defaultBranchRef {
        name
      }
      primaryLanguage {
        name
        color
      }
    }
  }
`;

/**
 * Fetch single repository details
 * @param {string} token - GitHub access token
 * @param {string} owner - Repository owner
 * @param {string} name - Repository name
 * @returns {Promise<Object>} Repository details
 */
export async function fetchRepoDetails(token, owner, name) {
  const { data, rateLimit } = await githubGraphQL(
    GET_REPO_QUERY,
    { owner, name },
    token
  );
  
  if (!data.repository) {
    throw new Error(`Repository ${owner}/${name} not found`);
  }
  
  return {
    repo: transformRepo({
      ...data.repository,
      stargazerCount: 0,
      forkCount: 0,
      languages: { nodes: [] },
      repositoryTopics: { nodes: [] },
    }),
    rateLimit,
  };
}
