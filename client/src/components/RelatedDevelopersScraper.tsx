import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Octokit } from "@octokit/core";
import { Pause, Play } from "lucide-react";
import React, { useRef, useState } from "react";
import { scrapeUsers, type FormData, type UserProfile } from "../scraping-logic/relatedDevelopersScraper";
import { RelatedDevelopersScraperForm } from "./RelatedDeveleporsForm";
import { ScraperResultsTable } from "./ScraperResultsTable";

const RelatedDevelopersScraper: React.FC = () => {
  const [rows, setRows] = useState<UserProfile[]>([]);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [octokit, setOctokit] = useState<Octokit>(new Octokit());
  const [currentFormData, setCurrentFormData] = useState<FormData | null>(null);
  const [totalProfiles, setTotalProfiles] = useState(0);
  const [processedProfiles, setProcessedProfiles] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const pauseRef = useRef(false);

  const handleFormSubmit = async (
    formData: FormData,
    owner: string,
    repo: string,
    mode: string
  ) => {
    setCurrentFormData(formData);
    setRows([]);
    setProgress(0);
    setProcessedProfiles(0);
    setIsPaused(false);
    pauseRef.current = false;

    try {
      // Get repo info first to show total count
      const repoInfo = await octokit.request(`GET /repos/${owner}/${repo}`, {});
      const totalCount = mode === "stargazers" 
        ? repoInfo.data.stargazers_count 
        : mode === "forks" 
          ? repoInfo.data.forks_count 
          : repoInfo.data.subscribers_count;
      
      setTotalProfiles(totalCount);

      await scrapeUsers(
        octokit,
        owner,
        repo,
        mode,
        formData,
        (message) => {
          setProcessedProfiles(prev => {
            const newProcessed = prev + 1;
            setStatusMessage(`Getting % of repos with selected languages for ${owner}. (${newProcessed} of ${totalCount} profiles processed)`);
            return newProcessed;
          });
        },
        setProgress,
        (user) => {
          setRows((prevRows) => {
            const newRows = [...prevRows];
            const existingIndex = newRows.findIndex(
              (row) => row.login === user.login
            );
            if (existingIndex >= 0) {
              newRows[existingIndex] = user;
            } else {
              newRows.push(user);
            }
            return newRows;
          });
        },
        () => pauseRef.current // Pass the pause check function
      );
    } catch (error) {
      console.error("Error scraping users:", error);
      setStatusMessage("Error scraping users. Please try again.");
    } finally {
      setProgress(0);
      setTotalProfiles(0);
      setProcessedProfiles(0);
      setIsPaused(false);
      pauseRef.current = false;
    }
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
    pauseRef.current = !pauseRef.current;
  };

  const openAllProfiles = (rows: UserProfile[]) => {
    rows.forEach((row) => {
      window.open(row.html_url, "_blank");
    });
  };

  const copyAllProfiles = (rows: UserProfile[]) => {
    const urls = rows.map((row) => row.html_url).join("\n");
    navigator.clipboard.writeText(urls);
  };

  return (
    <div className="">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Related Developers Finder</h1>
        <RelatedDevelopersScraperForm
          onSubmit={handleFormSubmit}
          isLoading={progress > 0}
          onOctokitUpdate={setOctokit}
        />

        <div className="my-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <p className="text-sm text-muted-foreground">
                {statusMessage}
              </p>
              {progress > 0 && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={togglePause}
                  className="h-8 w-8"
                >
                  {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                </Button>
              )}
            </div>
            {progress > 0 && (
              <Progress value={Math.min(progress * 100, 100)} className="w-full mt-2" aria-label="Progress indicator" />
            )}
          </div>
        </div>
      </div>

      {currentFormData && (
        <ScraperResultsTable
          rows={rows}
          formData={currentFormData}
          onOpenAllProfiles={openAllProfiles}
          onCopyAllProfiles={copyAllProfiles}
        />
      )}
    </div>
  );
}

export default RelatedDevelopersScraper; 