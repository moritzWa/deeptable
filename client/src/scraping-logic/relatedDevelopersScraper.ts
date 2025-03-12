import { Octokit } from "@octokit/core";
import { makeGitHubRequest, withRateLimitRetry } from "../utils/githubApi";
import { normalizeLocation } from "../utils/locationNormalizer";

// Types
export interface UserProfile {
  name: string;
  login: string;
  avatar_url: string;
  email: string | null;
  twitter_username: string | null;
  html_url: string;
  blog: string;
  repos_url: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
  JSpercentage?: number;
  TSpercentage?: number;
  PythonPercentage?: number;
  GoPercentage?: number;
  RustPercentage?: number;
  CppPercentage?: number;
  location: string | null;
  normalizedLocation: {
    city: string | null;
    province: string | null;
    country: string | null;
    timezone: string | null;
  };
  originalLocation: string | null;  // Keep the original value
  company: string | null;
  bio: string | null;
  hireable: boolean | null;
  public_gists: number;
  isContributor?: boolean;
  contributionsCount?: number;
}

export interface FormData {
  langJS: { checked: boolean };
  langTS: { checked: boolean };
  langPython: { checked: boolean };
  langGo: { checked: boolean };
  langRust: { checked: boolean };
  langCpp: { checked: boolean };
  repos: { value: number };
  followers: { value: number };
  following: { value: number };
  account_created: { value: number };
  repo_updated: { value: number };
  langPerc: { value: number };
}

interface LanguageInfo {
  totalJSRepo: number;
  totalTSRepo: number;
  totalPythonRepo: number;
  totalGoRepo: number;
  totalRustRepo: number;
  totalCppRepo: number;
  totalRepos: number;
}

interface OctokitResponse<T> {
  data: T;
}

interface Repository {
  language?: string;
}

interface RepoInfo {
  data: {
    stargazers_count: number;
    forks_count: number;
    subscribers_count: number;
  };
}

interface StargazerResponse {
  data: Array<{
    login: string;
    owner?: {
      login: string;
    };
  }>;
}

interface UserProfileResponse {
  data: UserProfile;
}

interface ContributorMap {
  [username: string]: number;  // maps username to contribution count
}

// Constants
const ONE_YEAR = 1000 * 60 * 60 * 24 * 365;
const requestTimeout = 5000; //in seconds
const maxRequest = 5;

// Helper Functions
const getPercentage = (value: number, total: number): number => {
  return parseInt(((value / total) * 100).toString());
};

// Core Functions
const getOctokitResponse = async <T,>(
  octokit: Octokit,
  route: string,
  options: Record<string, any>,
  onStatusUpdate?: (message: string) => void
): Promise<OctokitResponse<T>> => {
  const data = await withRateLimitRetry(
    () => makeGitHubRequest<T>(octokit, route, options, onStatusUpdate),
    onStatusUpdate
  );
  return { data };
};

// Add a cache for contributor counts
let contributorCountsCache: ContributorMap = {};

const getResource = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  curPage: number,
  mode: string
) => {
  // Special handling for contributors mode
  if (mode === "contributors") {
    const response = await getOctokitResponse<Array<{ login: string; contributions: number }>>(
      octokit,
      `GET /repos/${owner}/${repo}/contributors`,
      {
        per_page: 100,
        page: curPage,
      }
    );
    
    // Store contribution counts in cache
    response.data.forEach(item => {
      contributorCountsCache[item.login] = item.contributions;
    });

    return {
      ...response,
      data: response.data.map(item => ({
        login: item.login,
      }))
    };
  }

  const endpoint = mode === "watchers" ? "subscribers" : mode;
  const response = await getOctokitResponse<StargazerResponse["data"]>(
    octokit,
    `GET /repos/${owner}/${repo}/${endpoint}`,
    {
      per_page: 100,
      page: curPage,
    }
  );
  
  // Transform the response for forks to match the expected format
  if (mode === "forks") {
    return {
      ...response,
      data: response.data.map(item => ({
        login: item.owner?.login || '',
      }))
    };
  }
  
  return response;
};

const getAllContributors = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  onStatusUpdate?: (message: string) => void
): Promise<ContributorMap> => {
  try {
    onStatusUpdate?.(`Fetching all contributors for ${owner}/${repo}`);
    const contributorsMap: ContributorMap = {};
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await getOctokitResponse<Array<{ login: string; contributions: number }>>(
        octokit,
        `GET /repos/${owner}/${repo}/contributors`,
        {
          per_page: 100,
          page: page
        }
      );

      if (response.data.length === 0) {
        hasMore = false;
      } else {
        response.data.forEach(contributor => {
          contributorsMap[contributor.login] = contributor.contributions;
        });
        page++;
      }
    }

    return contributorsMap;
  } catch (error) {
    console.error(`Error fetching contributors for ${owner}/${repo}:`, error);
    return {};
  }
};

const getFullUserProfile = async (octokit: Octokit, user: string) => {
  return await getOctokitResponse(octokit, `GET /users/${user}`, {});
};

const getLanguageInfo = async (
  octokit: Octokit,
  user: string,
  form_data: FormData,
  onStatusUpdate?: (message: string) => void
): Promise<LanguageInfo | undefined> => {
  // Check if any languages are selected
  const anyLanguageSelected = form_data.langJS.checked || 
    form_data.langTS.checked || 
    form_data.langPython.checked || 
    form_data.langGo.checked || 
    form_data.langRust.checked || 
    form_data.langCpp.checked;

  // If no languages selected, return undefined
  if (!anyLanguageSelected) {
    return undefined;
  }

  onStatusUpdate?.(`Getting % of repos with selected languages for ${user}.`);
  const repos = await getOctokitResponse<Repository[]>(
    octokit,
    `GET /users/${user}/repos`,
    {}
  );
  const totalRepos = repos.data.length;
  let totalJSRepo = 0;
  let totalTSRepo = 0;
  let totalPythonRepo = 0;
  let totalGoRepo = 0;
  let totalRustRepo = 0;
  let totalCppRepo = 0;

  repos.data.forEach((repo: Repository) => {
    const lang = repo.language?.toLowerCase();
    if (form_data.langJS.checked && lang === "javascript") totalJSRepo++;
    if (form_data.langTS.checked && lang === "typescript") totalTSRepo++;
    if (form_data.langPython.checked && lang === "python") totalPythonRepo++;
    if (form_data.langGo.checked && lang === "go") totalGoRepo++;
    if (form_data.langRust.checked && lang === "rust") totalRustRepo++;
    if (form_data.langCpp.checked && (lang === "c++" || lang === "cpp")) totalCppRepo++;
  });

  return { 
    totalJSRepo, 
    totalTSRepo, 
    totalPythonRepo,
    totalGoRepo,
    totalRustRepo,
    totalCppRepo,
    totalRepos 
  };
};

const validUserProfile = (
  userInfo: UserProfileResponse,
  form: FormData
): boolean => {
  const createdAtTime = new Date(userInfo.data.created_at).getTime();
  const updatedAtTime = new Date(userInfo.data.updated_at).getTime();
  const currentTime = new Date().getTime();

  return (
    userInfo.data.name !== null &&
    userInfo.data.public_repos > form.repos.value &&
    userInfo.data.followers > form.followers.value &&
    userInfo.data.following > form.following.value &&
    currentTime - createdAtTime > ONE_YEAR * form.account_created.value &&
    currentTime - updatedAtTime < ONE_YEAR * form.repo_updated.value
  );
};

const getCriteriaPassedProfile = async (
  octokit: Octokit,
  user: string,
  form: FormData
): Promise<UserProfileResponse | null> => {
  const userProfile = await getFullUserProfile(octokit, user);
  if (validUserProfile(userProfile as UserProfileResponse, form))
    return userProfile as UserProfileResponse;
  return null;
};

export const scrapeUsers = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  mode: string,
  formData: FormData,
  onStatusUpdate?: (message: string) => void,
  onProgressUpdate?: (progress: number) => void,
  onUserUpdate?: (user: UserProfile) => void,
  isPaused?: () => boolean
): Promise<void> => {
  // Reset cache at start of scraping
  contributorCountsCache = {};

  // Get repo info and contributors map at the start
  onStatusUpdate?.(`Fetching repo info${mode !== "contributors" ? " and contributors" : ""} for ${owner}/${repo}`);
  const [repoInfo, contributorsMap] = await Promise.all([
    getOctokitResponse<RepoInfo["data"]>(
      octokit,
      `GET /repos/${owner}/${repo}`,
      {}
    ),
    // Only fetch contributors if not in contributors mode
    mode === "contributors" 
      ? Promise.resolve({} as ContributorMap) 
      : getAllContributors(octokit, owner, repo, onStatusUpdate)
  ]);

  let curPage = 1;
  let hasNextPage = true;
  let processedUsers = 0;
  const totalStars = repoInfo.data.stargazers_count;

  while (hasNextPage) {
    // Check if paused
    while (isPaused?.()) {
      await new Promise(resolve => setTimeout(resolve, 100)); // Wait while paused
    }

    onStatusUpdate?.(`Fetching ${mode} page ${curPage}.`);
    const response = await getResource(octokit, owner, repo, curPage, mode);
    const users = response.data;

    if (users.length === 0) {
      hasNextPage = false;
      continue;
    }

    for (const user of users) {
      // Check if paused
      while (isPaused?.()) {
        await new Promise(resolve => setTimeout(resolve, 100)); // Wait while paused
      }

      try {
        const userProfile = await getCriteriaPassedProfile(octokit, user.login, formData);

        // we only run 1) language info and 2) normalized location: if the profile passed the criteria
        if (userProfile) {
          const languageInfo = await getLanguageInfo(
            octokit,
            user.login,
            formData,
            onStatusUpdate
          );
          
          const normalizedLocationData = normalizeLocation(userProfile.data.location);

          // Use the cached contributor counts if in contributor mode
          const contributionsCount = mode === "contributors" 
            ? contributorCountsCache[user.login] || 0
            : contributorsMap[user.login] || 0;

          const fullProfile = {
            name: userProfile.data.name || user.login,
            login: userProfile.data.login,
            avatar_url: userProfile.data.avatar_url,
            email: userProfile.data.email,
            twitter_username: userProfile.data.twitter_username,
            html_url: userProfile.data.html_url,
            blog: userProfile.data.blog,
            repos_url: userProfile.data.repos_url,
            public_repos: userProfile.data.public_repos,
            followers: userProfile.data.followers,
            following: userProfile.data.following,
            created_at: userProfile.data.created_at,
            updated_at: userProfile.data.updated_at,
            JSpercentage: getPercentage(languageInfo?.totalJSRepo || 0, languageInfo?.totalRepos || 0),
            TSpercentage: getPercentage(languageInfo?.totalTSRepo || 0, languageInfo?.totalRepos || 0),
            PythonPercentage: getPercentage(languageInfo?.totalPythonRepo || 0, languageInfo?.totalRepos || 0),
            GoPercentage: getPercentage(languageInfo?.totalGoRepo || 0, languageInfo?.totalRepos || 0),
            RustPercentage: getPercentage(languageInfo?.totalRustRepo || 0, languageInfo?.totalRepos || 0),
            CppPercentage: getPercentage(languageInfo?.totalCppRepo || 0, languageInfo?.totalRepos || 0),
            location: userProfile.data.location,
            normalizedLocation: normalizedLocationData,
            originalLocation: userProfile.data.location,
            company: userProfile.data.company,
            bio: userProfile.data.bio,
            hireable: userProfile.data.hireable,
            public_gists: userProfile.data.public_gists,
            isContributor: contributionsCount > 0,
            contributionsCount
          };

          onUserUpdate?.(fullProfile);
        }
      } catch (error) {
        console.error(`Error processing user ${user.login}:`, error);
      }

      processedUsers++;
      onStatusUpdate?.(`Getting % of repos with selected languages for ${owner}.`);
      onProgressUpdate?.(processedUsers / totalStars);
    }

    curPage++;
  }
}; 