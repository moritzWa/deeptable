import { Octokit } from "@octokit/core";

interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  used: number;
}

export class RateLimitError extends Error {
  resetDate: Date;
  waitTimeMs: number;

  constructor(resetTimestamp: number) {
    const resetDate = new Date(resetTimestamp * 1000);
    const waitTimeMs = resetDate.getTime() - Date.now();
    super(`Rate limit exceeded. Reset at ${resetDate.toLocaleString()}. Wait time: ${Math.ceil(waitTimeMs / 1000)} seconds`);
    this.resetDate = resetDate;
    this.waitTimeMs = waitTimeMs;
  }
}

export async function makeGitHubRequest<T>(
  octokit: Octokit,
  route: string,
  options: Record<string, any> = {},
  onStatusUpdate?: (message: string) => void,
  maxRetries = 3
): Promise<T> {
  let retryCount = 0;

  while (true) {
    try {
      const response = await octokit.request(route, {
        ...options,
        headers: {
          ...options.headers,
          "X-GitHub-Api-Version": "2022-11-28",
        },
      });

      // Extract rate limit info from headers
      const rateLimitInfo: RateLimitInfo = {
        limit: parseInt(response.headers["x-ratelimit-limit"] as string),
        remaining: parseInt(response.headers["x-ratelimit-remaining"] as string),
        reset: parseInt(response.headers["x-ratelimit-reset"] as string),
        used: parseInt(response.headers["x-ratelimit-used"] as string),
      };

      // If we're running low on remaining requests, notify via status update
      if (rateLimitInfo.remaining < rateLimitInfo.limit * 0.1) {
        const resetDate = new Date(rateLimitInfo.reset * 1000);
        onStatusUpdate?.(
          `Warning: ${rateLimitInfo.remaining}/${rateLimitInfo.limit} API requests remaining. Limit resets at ${resetDate.toLocaleString()}`
        );
      }

      return response.data as T;
    } catch (error: any) {
      // Check if it's a rate limit error
      if (error.status === 403 && error.response?.headers["x-ratelimit-remaining"] === "0") {
        const resetTimestamp = parseInt(
          error.response.headers["x-ratelimit-reset"] as string
        );
        throw new RateLimitError(resetTimestamp);
      }

      // For other errors, implement retry logic
      retryCount++;
      if (retryCount === maxRetries) {
        throw error;
      }

      // Exponential backoff
      const waitTime = Math.min(1000 * Math.pow(2, retryCount), 10000);
      onStatusUpdate?.(
        `Request failed, retrying in ${waitTime / 1000} seconds... (${
          maxRetries - retryCount
        } retries left)`
      );
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }
}

export async function withRateLimitRetry<T>(
  fn: () => Promise<T>,
  onStatusUpdate?: (message: string) => void
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (error instanceof RateLimitError) {
      onStatusUpdate?.(
        `Rate limit exceeded. Waiting ${Math.ceil(
          error.waitTimeMs / 1000
        )} seconds until ${error.resetDate.toLocaleString()}`
      );
      await new Promise((resolve) => setTimeout(resolve, error.waitTimeMs));
      return withRateLimitRetry(fn, onStatusUpdate);
    }
    // Re-throw any other errors
    throw error;
  }
} 