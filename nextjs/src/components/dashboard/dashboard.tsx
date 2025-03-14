"use client";

import { api, type RouterOutputs } from "~/trpc/react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Trash2, Search, Tag } from "lucide-react";
import { Skeleton } from "~/components/ui/skeleton";
import { useToast } from "~/hooks/use-toast";
import { Input } from "~/components/ui/input";
import { useState } from "react";
import { Badge } from "~/components/ui/badge";

type GeneratedReadme =
  RouterOutputs["dashboard"]["getUserData"]["readmes"][number];

function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-5 w-48" />
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[72px] w-full" />
        ))}
      </div>
    </div>
  );
}

export function Dashboard() {
  const utils = api.useUtils();
  const { toast } = useToast();
  const { data, isLoading } = api.dashboard.getUserData.useQuery();
  const [searchQuery, setSearchQuery] = useState("");
  const deleteReadme = api.dashboard.deleteReadme.useMutation({
    onSuccess: (_, variables) => {
      void utils.dashboard.getUserData.invalidate();
      toast({
        title: "README deleted",
        description: `${variables.repoPath} was deleted successfully`,
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete README",
      });
    },
  });

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!data) {
    return (
      <Card className="bg-red-50">
        <div className="p-6 text-red-800">Failed to load dashboard data</div>
      </Card>
    );
  }

  const handleDelete = (id: string, repoPath: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    deleteReadme.mutate({ id, repoPath });
  };

  const filteredReadmes = data.readmes.filter((readme) =>
    readme.repoPath.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="mx-auto max-w-2xl space-y-4 pb-8">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search your chats..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="text-sm text-muted-foreground">
        You have {data.readmes.length} previous READMEs
      </div>

      <div className="flex flex-col gap-3">
        {filteredReadmes.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground">
            No READMEs found
          </div>
        ) : (
          filteredReadmes.map((readme: GeneratedReadme) => (
            <Link
              key={readme.id}
              href={`/${readme.repoPath}/${readme.shortId}`}
              className="group"
            >
              <Card className="transition-colors hover:bg-accent/50">
                <div className="flex items-center justify-between p-4">
                  <div className="flex flex-col gap-1">
                    <div className="line-clamp-1 text-sm font-medium">
                      {readme.repoPath}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="flex items-center">
                        <Tag className="mr-1 h-3 w-3" />
                        {readme.shortId}
                      </span>
                      <span className="text-xs">•</span>
                      {readme.updatedAt
                        ? formatDistanceToNow(new Date(readme.updatedAt), {
                            addSuffix: true,
                          })
                        : "unknown time"}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100"
                    onClick={(e) => handleDelete(readme.id, readme.repoPath, e)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
