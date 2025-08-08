import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { formatDistanceToNow, parseISO } from "date-fns";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Calendar,
  Mail,
  Settings,
  User as UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { fetchBookmarks } from "@/data/bookmarks";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/profile/")({
  component: ProfileIndexRoute,
});

function ProfileIndexRoute() {
  const { user, isAuthenticated, isLoading } = useAuth();

  const { data: bookmarks } = useQuery({
    queryKey: ["bookmarks"],
    queryFn: fetchBookmarks,
    enabled: isAuthenticated,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center flex-1">
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    redirect({ to: "/login" });
    return null;
  }

  const bookmarkCount = bookmarks?.length || 0;
  const memberSince = user.createdAt
    ? formatDistanceToNow(parseISO(user.createdAt), { addSuffix: true })
    : "Unknown";

  return (
    <div className="flex items-center justify-center flex-1 bg-background p-4 text-foreground">
      <div className="flex flex-col max-w-3xl w-full gap-4 py-8">
        <div className="flex flex-col text-center gap-2">
          <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center mx-auto">
            <UserIcon className="w-12 h-12 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user.displayName || "User"}</h1>
            <p className="text-muted-foreground text-md">{user.email}</p>
          </div>
        </div>

        <div className="my-2" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4 border border-accent-foreground/10">
            <div className="flex items-start gap-4">
              <div className=" bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center p-4">
                <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Email Address
                </p>
                <p className="text-md font-semibold break-all">{user.email}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border border-accent-foreground/10">
            <div className="flex items-start gap-4">
              <div className="bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center p-4">
                <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Member Since
                </p>
                <p className="text-md font-semibold">
                  User since {memberSince}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-4 border border-accent-foreground/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 text-purple-600 dark:text-purple-400 font-bold">
                  <Bookmark />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Bookmarks Saved
                </p>
                <p className="text-2xl font-bold">{bookmarkCount}</p>
              </div>
            </div>
            <Link to="/">
              <Button variant="outline">View Bookmarks</Button>
            </Link>
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Account Settings</h2>
          <div className="flex flex-col gap-2">
            <Link to="/profile/change-password">
              <Card className="p-4 hover:bg-accent transition-colors cursor-pointer border border-accent-foreground/10 group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Settings className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Change Password</p>
                      <p className="text-sm text-muted-foreground">
                        Update your account password
                      </p>
                    </div>
                  </div>
                  <div className="text-muted-foreground">
                    <ArrowRight className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center pt-4">
          <Link to="/">
            <Button variant="ghost">
              <ArrowLeft className="w-4 h-4" />
              Back to Bookmarks
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
