import { Octokit } from "@octokit/core";
import { withRateLimitRetry } from "../utils/githubApi";

export interface Contributor {
  login: string;
  name?: string;
  email?: string | string[] | undefined;
  firstName?: string;
  lastName?: string;
  location?: string | undefined;
  blog?: string | undefined;
  twitter_username?: string | undefined;
  contributionsToRepo: number;
  html_url: string;
  repositoryName: string;
  repositoryUrl: string;
  repositoryDescription?: string;
  repositoryWebsiteURL?: string;
  repositoryStars?: string;
  numOpenPullRequests: number;
  numOpenIssues: number;
  contributions?: number;
}

interface RepositoryInfo {
  repositoryName: string;
  repositoryDescription: string | null;
  repositoryStars: string;
  repositoryHomepage: string | null;
}

interface GitHubContributor {
  login: string;
  contributions: number;
  html_url: string;
  [key: string]: any;
}

interface GitHubUserProfile {
  name?: string;
  email?: string | null;
  html_url: string;
  location?: string | null;
  blog?: string;
  twitter_username?: string | null;
  [key: string]: any;
}

interface GitHubRepoResponse {
  name: string;
  description: string | null;
  stargazers_count: number;
  homepage: string | null;
  open_issues_count: number;
}

interface OctokitResponse<T> {
  data: T;
  [key: string]: any;
}

interface PullRequest {
  base: {
    repo: {
      open_issues_count: number;
    };
  };
}

const requestTimeout = 5000; // in milliseconds
const maxRequest = 3;

const makeRequestWithRetry = async <T,>(
  octokit: Octokit,
  route: string,
  options: Record<string, any> = {},
  onStatusUpdate?: (message: string) => void
): Promise<T> => {
  try {
    const response = await withRateLimitRetry(
      () => octokit.request(route, {
        ...options,
        headers: {
          ...options.headers,
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }),
      onStatusUpdate
    );
    
    if (!response || !response.data) {
      throw new Error("No response received from GitHub API");
    }
    
    return response.data as T;
  } catch (error) {
    console.error("Request failed:", error);
    throw error;
  }
};

const filterBotsFromContributors = (contributors: Contributor[]): Contributor[] => {
  return contributors.filter(
    (contributor) =>
      contributor &&
      contributor.login &&
      !(contributor.login.includes("-bot") || contributor.login.includes("[bot]"))
  );
};

const formatStarCount = (count: number): string => {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + "M";
  } else if (count >= 1000) {
    return (count / 1000).toFixed(1) + "k";
  } else {
    return count.toString();
  }
};

const getUserEmailFromCommits = async (
  owner: string,
  repo: string,
  username: string,
  octokit: Octokit
): Promise<string | null> => {
  try {
    const { data: commits } = await octokit.request(
      `GET /repos/${owner}/${repo}/commits`,
      {
        author: username,
        per_page: 100,
      }
    );

    for (const commit of commits) {
      const email = commit.commit.author?.email;
      if (email && !email.endsWith("@users.noreply.github.com")) {
        return email;
      }
    }
  } catch (err) {
    console.error(`Failed to fetch commits for ${username}:`, err);
  }
  return null;
};

const finalEmail = (
  emailFromProfile: string | null | undefined,
  emailFromCommits: string | null
): string | string[] | undefined => {
  if (emailFromProfile && emailFromCommits && emailFromProfile !== emailFromCommits) {
    return [emailFromProfile, emailFromCommits];
  }
  return emailFromProfile || emailFromCommits || undefined;
};

const getFullUserProfile = async (octokit: Octokit, username: string): Promise<GitHubUserProfile> => {
  return await makeRequestWithRetry<GitHubUserProfile>(
    octokit,
    `GET /users/${username}`,
    {}
  );
};

const getRepositoryInfo = async (
  owner: string,
  repo: string,
  octokit: Octokit
): Promise<RepositoryInfo | null> => {
  try {
    const response = await makeRequestWithRetry<GitHubRepoResponse>(
      octokit,
      "GET /repos/{owner}/{repo}",
      {
        owner,
        repo,
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );

    return {
      repositoryName: response.name,
      repositoryDescription: response.description,
      repositoryStars: formatStarCount(response.stargazers_count),
      repositoryHomepage: response.homepage,
    };
  } catch (err) {
    console.error(`Failed to fetch repository info for ${owner}/${repo}:`, err);
    return null;
  }
};

const getOpenIssuesAndPRs = async (owner: string, repo: string, octokit: Octokit) => {
  const openPullRequests: PullRequest[] = [];
  let page = 1;
  let totalOpenIssues = 0;

  while (true) {
    const response = await makeRequestWithRetry<PullRequest[]>(
      octokit,
      "GET /repos/{owner}/{repo}/pulls",
      {
        owner,
        repo,
        state: "open",
        per_page: 100,
        page,
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );

    if (!Array.isArray(response)) {
      break;
    }

    openPullRequests.push(...response);

    if (response.length > 0 && response[0].base.repo.open_issues_count) {
      totalOpenIssues = response[0].base.repo.open_issues_count;
    }

    if (response.length < 100) {
      break;
    }
    page++;
  }

  return {
    openPullRequests,
    totalOpenIssues,
  };
};

export const getContributorsForRepo = async (
  owner: string,
  repo: string,
  octokit: Octokit,
  onStatusUpdate?: (message: string) => void
): Promise<Contributor[]> => {
  try {
    onStatusUpdate?.("Fetching repository contributors...");
    
    const contributors = await makeRequestWithRetry<GitHubContributor[]>(
      octokit,
      "GET /repos/{owner}/{repo}/contributors",
      {
        owner,
        repo,
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
        per_page: 100
      }
    );

    if (!Array.isArray(contributors)) {
      throw new Error("Invalid response format from GitHub API");
    }

    onStatusUpdate?.(`Found ${contributors.length} contributors. Fetching details...`);

    const { openPullRequests, totalOpenIssues } = await getOpenIssuesAndPRs(
      owner,
      repo,
      octokit
    );
    const repoInfo = await getRepositoryInfo(owner, repo, octokit);

    const contributorsWithProfiles = await Promise.all(
      contributors.map(async (contributor: GitHubContributor) => {
        onStatusUpdate?.(`Fetching details for ${contributor.login}...`);
        const profile = await getFullUserProfile(octokit, contributor.login);
        let emailFromProfile = profile.email;
        let emailFromCommits: string | null = null;

        if (!emailFromProfile) {
          emailFromCommits = await getUserEmailFromCommits(
            owner,
            repo,
            contributor.login,
            octokit
          );
        }

        const contributorInfo: Contributor = {
          login: contributor.login,
          name: profile.name,
          email: finalEmail(emailFromProfile, emailFromCommits),
          firstName: profile.name ? profile.name.split(" ")[0] : "",
          lastName: profile.name ? profile.name.split(" ")[1] : "",
          location: profile.location || undefined,
          blog: profile.blog || undefined,
          twitter_username: profile.twitter_username || undefined,
          contributionsToRepo: contributor.contributions,
          html_url: contributor.html_url,
          repositoryUrl: `https://github.com/${owner}/${repo}`,
          repositoryName: repoInfo?.repositoryName || "",
          repositoryDescription: repoInfo?.repositoryDescription || "",
          repositoryStars: repoInfo?.repositoryStars || "",
          repositoryWebsiteURL: repoInfo?.repositoryHomepage || "",
          numOpenPullRequests: openPullRequests.length,
          numOpenIssues: totalOpenIssues - openPullRequests.length,
        };

        return contributorInfo;
      })
    );

    onStatusUpdate?.("Filtering out bot accounts...");
    return filterBotsFromContributors(contributorsWithProfiles);
  } catch (err) {
    console.error(`Failed to fetch contributors for ${repo}:`, err);
    throw err;
  }
}; 