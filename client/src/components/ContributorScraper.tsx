import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type { FormPreferences } from "@/types";
import { Octokit } from "@octokit/core";
import { saveAs } from "file-saver";
import React, { useEffect, useState } from "react";
import { getContributorsForRepo, type Contributor } from "../scraping-logic/contributorsScraper";
import { trpc } from "../utils/trpc";
import { UpgradeDialog } from "./UpgradeDialog";

export const ContributorScraper: React.FC = () => {
  const [apiKey, setApiKey] = useState<string | undefined>("");
  const [repositoryUrl, setRepositoryUrl] = useState<string>("");
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [octokit, setOctokit] = useState<Octokit>(
    new Octokit({ auth: apiKey })
  );
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState("");
  const [usageInfo, setUsageInfo] = useState({ currentUsage: 0, limit: 0 });

  // Get user data including form preferences
  const { data: userData } = trpc.auth.getUser.useQuery(
    { token: localStorage.getItem('token') || '' },
    { enabled: !!localStorage.getItem('token') }
  );

  // Update form preferences mutation
  const updatePreferences = trpc.auth.updateFormPreferences.useMutation();

  // Load saved preferences when user data is available
  useEffect(() => {
    if (userData?.formPreferences) {
      const preferences = userData.formPreferences as FormPreferences;
      if (preferences.apiKey) {
        setApiKey(preferences.apiKey);
        setOctokit(new Octokit({ auth: preferences.apiKey }));
      }
      if (preferences.repositoryUrl) {
        setRepositoryUrl(preferences.repositoryUrl);
      }
    }
  }, [userData]);

  // Save preferences when they change
  const handlePreferencesChange = async (updates: { apiKey?: string; repositoryUrl?: string }) => {
    if (!localStorage.getItem('token')) return;

    try {
      const currentPrefs = userData?.formPreferences || {};
      // Omit target_mode from currentPrefs to avoid type error
      const { target_mode, ...restPrefs } = currentPrefs;
      const updatedPrefs = {
        ...restPrefs,
        ...(updates.apiKey !== undefined && { apiKey: updates.apiKey }),
        ...(updates.repositoryUrl !== undefined && { repositoryUrl: updates.repositoryUrl }),
      };

      await updatePreferences.mutateAsync({
        token: localStorage.getItem('token') || '',
        formPreferences: updatedPrefs
      });
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  };

  const checkUsage = trpc.auth.checkAndIncrementExportUsage.useMutation();

  const handleExportAction = async (action: () => void) => {
    try {
      const result = await checkUsage.mutateAsync({
        token: localStorage.getItem('token') || '',
      });

      if (!result.canExport) {
        setUpgradeMessage(result.message || "You've reached the export limit");
        setUsageInfo({
          currentUsage: result.currentUsage || 0,
          limit: result.limit || 0,
        });
        setShowUpgradeDialog(true);
        return;
      }

      action();
    } catch (error) {
      console.error('Failed to check usage:', error);
    }
  };

  const exportToCSV = () => {
    const headers =
      '"Username","Name","Email","First Name","Last Name","Location","Blog","Twitter","contributionsToRepo","Repository Name","Repository URL", "GitHub User Profile URL", "Repository Description","Repository Website URL","Repository Stars","Open Pull Requests","Open Issues"';
    const csvData = contributors.map((contributor) => {
      const emailField = Array.isArray(contributor.email)
        ? contributor.email.join(", ")
        : contributor.email;

      const escapeCsv = (value: any): string => {
        const stringValue =
          value === null || value === undefined ? "" : String(value);
        return `"${stringValue.replace(/"/g, '""')}"`;
      };

      return [
        escapeCsv(contributor.login),
        escapeCsv(contributor.name || contributor.login),
        escapeCsv(emailField),
        escapeCsv(contributor.firstName),
        escapeCsv(contributor.lastName),
        escapeCsv(contributor.location),
        escapeCsv(contributor.blog),
        escapeCsv(contributor.twitter_username),
        contributor.contributionsToRepo,
        escapeCsv(contributor.repositoryName),
        escapeCsv(contributor.repositoryUrl),
        escapeCsv(contributor.html_url),
        escapeCsv(contributor.repositoryDescription),
        escapeCsv(contributor.repositoryWebsiteURL),
        escapeCsv(contributor.repositoryStars),
        contributor.numOpenPullRequests,
        contributor.numOpenIssues,
      ].join(",");
    });

    const csvContent = [headers, ...csvData].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    saveAs(blob, "contributors.csv");
  };

  const handleSimpleURLSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setStatusMessage("Fetching contributors...");
    setError(null);
    setContributors([]);

    try {
      if (!repositoryUrl) {
        throw new Error("Please enter a repository URL");
      }

      // Extract owner and repo from URL
      const urlParts = repositoryUrl.replace(/\/$/, '').split('/');
      const repo = urlParts.pop() || '';
      const owner = urlParts.pop() || '';

      if (!owner || !repo) {
        throw new Error("Invalid repository URL. Please use format: owner/repo");
      }

      const contributors = await getContributorsForRepo(
        owner,
        repo,
        octokit,
        (message) => {
          setStatusMessage(message);
          console.log(message); // For debugging
        }
      );

      if (contributors.length === 0) {
        setError("No contributors found matching the criteria");
      } else {
        setContributors(contributors);
        setStatusMessage(`Found ${contributors.length} contributors`);
      }
    } catch (err: any) {
      console.error("Error fetching contributors:", err);
      setError(err.message || "Failed to fetch contributors. Please check your API key and repository URL.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Repository Contributors</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Find and analyze the most active contributors of any GitHub repository
      </p>

      <Card className="p-6 mb-8">
        <form onSubmit={handleSimpleURLSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="apiKey">GitHub API Key</Label>
              <Input
                id="apiKey"
                // type="password"
                placeholder="Enter your GitHub API key"
                value={apiKey}
                onChange={(e) => {
                  const newApiKey = e.target.value;
                  setApiKey(newApiKey);
                  setOctokit(new Octokit({ auth: newApiKey }));
                  handlePreferencesChange({ apiKey: newApiKey });
                }}
              />
            </div>

            <div>
              <Label htmlFor="repositoryUrl">Repository URL</Label>
              <Input
                id="repositoryUrl"
                type="text"
                placeholder="Enter the repository URL (e.g., https://github.com/octokit/core.js)"
                value={repositoryUrl}
                onChange={(e) => {
                  const newRepositoryUrl = e.target.value;
                  setRepositoryUrl(newRepositoryUrl);
                  handlePreferencesChange({ repositoryUrl: newRepositoryUrl });
                }}
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Loading..." : "Get Contributors"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => handleExportAction(exportToCSV)}
                disabled={contributors.length === 0}
              >
                Export CSV
              </Button>
              {/* <Button
                type="button"
                variant="secondary"
                onClick={fetchAllOssInsightsProjects}
              >
                Fetch OSS Insights Projects
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={fetchAllMemberCollectives}
              >
                Fetch Open Collective Projects
              </Button> */}
            </div>
          </div>
        </form>
      </Card>

      {statusMessage && (
        <div className="mb-4">
          <p className="mb-2 text-center">{statusMessage}</p>
          {isLoading && <Progress value={100} className="w-full" />}
        </div>
      )}

      {error && (
        <div className="p-4 mb-4 text-red-500 bg-red-50 rounded-md">
          {error}
        </div>
      )}

      {contributors.length > 0 && (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>First Name</TableHead>
                <TableHead>Blog</TableHead>
                <TableHead>Twitter</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Contributions</TableHead>
                <TableHead>Profile</TableHead>
                <TableHead>Repository</TableHead>
                <TableHead>Website</TableHead>
                <TableHead>Stars</TableHead>
                <TableHead>PRs</TableHead>
                <TableHead>Issues</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contributors.map((contributor, index) => (
                <TableRow key={contributor.login}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{contributor.login}</TableCell>
                  <TableCell>{contributor.name}</TableCell>
                  <TableCell>
                    {contributor.email ? (
                      <a
                        href={`mailto:${contributor.email}`}
                        className="text-blue-600 hover:underline"
                      >
                        {contributor.email}
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </TableCell>
                  <TableCell>{contributor.firstName}</TableCell>
                  <TableCell>
                    {contributor.blog ? (
                      <a
                        href={contributor.blog}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {contributor.blog}
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </TableCell>
                  <TableCell>
                    {contributor.twitter_username && (
                      <a
                        href={`https://twitter.com/${contributor.twitter_username}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {contributor.twitter_username}
                      </a>
                    )}
                  </TableCell>
                  <TableCell>{contributor.location}</TableCell>
                  <TableCell>{contributor.contributionsToRepo}</TableCell>
                  <TableCell>
                    <a
                      href={contributor.html_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Profile
                    </a>
                  </TableCell>
                  <TableCell>
                    <a
                      href={contributor.repositoryUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {contributor.repositoryName}
                    </a>
                  </TableCell>
                  <TableCell>
                    {contributor.repositoryWebsiteURL && (
                      <a
                        href={contributor.repositoryWebsiteURL}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Visit Website
                      </a>
                    )}
                  </TableCell>
                  <TableCell>{contributor.repositoryStars}</TableCell>
                  <TableCell>{contributor.numOpenPullRequests}</TableCell>
                  <TableCell>{contributor.numOpenIssues}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <UpgradeDialog
        isOpen={showUpgradeDialog}
        onClose={() => setShowUpgradeDialog(false)}
        message={upgradeMessage}
        currentUsage={usageInfo.currentUsage}
        limit={usageInfo.limit}
      />
    </div>
  );
};