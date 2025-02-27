import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { Dashboard } from "~/components/dashboard/dashboard";
import { type Metadata } from "next";
import { Toaster } from "~/components/ui/toaster";
import { Button } from "~/components/ui/button";
import { CirclePlus } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dashboard | README Generator",
  description: "View your generated READMEs and usage statistics",
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  return (
    <div className="relative flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="">
        <h2 className="text-center text-3xl font-bold tracking-tight">
          Dashboard
        </h2>
      </div>
      <Dashboard />
      <div className="absolute right-4 top-0">
        <Button variant="default">
          <Link href="/">
            <span className="flex items-center gap-2">
              <CirclePlus className="h-4 w-4" />
              New README
            </span>
          </Link>
        </Button>
      </div>
      <Toaster />
    </div>
  );
}
