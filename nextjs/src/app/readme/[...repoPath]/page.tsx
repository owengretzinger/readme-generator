"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { type ViewMode } from "~/components/view-mode-toggle";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { GenerationState } from "~/hooks/use-readme-form";
import { Button } from "~/components/ui/button";
import { ReadmeLayout } from "~/components/readme/readme-layout";
import { toast } from "~/hooks/use-toast";

export default function SharedReadmePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const repoPath = Array.isArray(params.repoPath) 
    ? params.repoPath.join("/") 
    : params.repoPath!;
  const [viewMode, setViewMode] = useState<ViewMode>("preview");
  const [activeTab, setActiveTab] = useState("readme");
  
  // Get the version from the URL search params
  const version = searchParams.get("v") ? parseInt(searchParams.get("v")!) : undefined;

  const { data: readme, isLoading: readmeLoading, isPending: readmePending } = api.readme.getByRepoPath.useQuery(
    { repoPath, version },
    {
      retry: false,
      refetchOnWindowFocus: false,
    }
  );

  const { data: mostRecentVersion, isLoading: mostRecentVersionLoading } = api.readme.getMostRecentVersion.useQuery(
    { repoPath },
    {
      retry: false,
      refetchOnWindowFocus: false,
      enabled: !version,
    }
  );

  // Redirect to URL with version if not present
  useEffect(() => {
    if (!version && mostRecentVersion) {
      const latestVersion = mostRecentVersion?.version;
      router.replace(`/readme/${repoPath}?v=${latestVersion}`);
    } else if ((!version && mostRecentVersion === null && !mostRecentVersionLoading) || 
               (version && readme === null && !readmeLoading && !readmePending)) {
      // Redirect to generation page if:
      // 1. No version specified and we confirmed no readme exists, or
      // 2. Version specified but that version doesn't exist
      const repoUrl = `https://github.com/${repoPath}`;
      const searchParams = new URLSearchParams();
      searchParams.set("url", repoUrl);
      toast({
        title: "Redirecting to generation page",
        description: "The README was not found, so we're redirecting you to the generation page with the repo automatically filled in.",
      });
      router.push(`/readme?${searchParams.toString()}`);
    }
  }, [version, repoPath, router, mostRecentVersion, mostRecentVersionLoading, readme, readmeLoading, readmePending]);

  const isLoading = readmeLoading || mostRecentVersionLoading || readmePending;

  if (isLoading) {
    return (
      <div className="p-4 md:p-8">
        <h1 className="mb-4 text-4xl font-bold">README</h1>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span>Loading README</span>
          </div>
        </div>
      </div>
    );
  }

  if (!readme) {
    // Return null since the redirect will happen in the useEffect
    return null;
  }

  const settingsContent = (
    <div className="text-center text-muted-foreground w-full">
      <Button onClick={() => router.push("/readme")} className="w-full">
        Generate a New README
      </Button>
    </div>
  );

  return (
    <ReadmeLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      readmeViewMode={viewMode}
      setReadmeViewMode={setViewMode}
      repoPath={repoPath}
      version={version ?? readme.version}
      createdAt={readme.createdAt}
      currentUrl={window.location.href}
      generatedReadme={readme.content}
      generationState={GenerationState.IDLE}
      settingsContent={settingsContent}
    />
  );
} 