import { Link as LinkIcon, Check, Github } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "~/hooks/use-toast";
import Link from "next/link";

interface ReadmeInfoCardProps {
  repoPath: string;
  createdAt: Date | null;
  permalink: string;
  shortId?: string;
}

export function ReadmeInfoCard({
  repoPath,
  createdAt,
  permalink,
  shortId,
}: ReadmeInfoCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyPermalink = async () => {
    try {
      await navigator.clipboard.writeText(permalink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      toast({
        title: "Failed to copy to clipboard",
        description: "Please copy the permalink manually",
      });
    }
  };

  return (
    <div className="flex flex-col gap-2 border-b pb-6">
      <div className="flex flex-col gap-1">
        <time className="block text-xs text-muted-foreground sm:text-sm">
          {createdAt
            ? format(new Date(createdAt), "MMMM d, yyyy 'at' h:mm a")
            : "Unknown"}
        </time>

        <Link
          href={`https://github.com/${repoPath}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-2"
        >
          <h1 className="text-lg font-semibold tracking-tight sm:text-2xl">
            {repoPath}
          </h1>
          <Github className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-foreground" />
        </Link>
      </div>

      <button
        onClick={handleCopyPermalink}
        className="group flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground sm:text-sm"
      >
        {copied ? (
          <Check className="h-4 w-4" />
        ) : (
          <LinkIcon className="h-4 w-4" />
        )}
        <span className="truncate">{permalink}</span>
      </button>
    </div>
  );
}
