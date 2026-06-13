import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { formatDistanceToNow, parseISO } from "date-fns";
import { ArrowLeft, ArrowRight, Bookmark, KeyRound, LogOut } from "lucide-react";
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
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
          <span className="w-1 h-1 rounded-full bg-primary animate-pulse" />
          Loading...
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    redirect({ to: "/login" });
    return null;
  }

  const bookmarkCount = bookmarks?.length ?? 0;
  const memberSince = user.createdAt
    ? formatDistanceToNow(parseISO(user.createdAt), { addSuffix: true })
    : null;

  const initials = (user.displayName || user.email)
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex-1 flex justify-center px-4 py-12">
      <div className="flex flex-col max-w-lg w-full gap-8">

        {/* Identity */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-primary font-mono">{initials}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {user.displayName || user.email.split("@")[0]}
            </p>
            <p className="text-xs text-muted-foreground font-mono truncate">{user.email}</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-px bg-border rounded-sm overflow-hidden border border-border">
          <div className="bg-card px-4 py-3">
            <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider mb-1">Bookmarks</p>
            <p className="text-2xl font-bold font-display text-foreground leading-none">{bookmarkCount}</p>
          </div>
          <div className="bg-card px-4 py-3">
            <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider mb-1">Member since</p>
            <p className="text-xs font-medium text-foreground leading-tight mt-1">
              {memberSince ?? "—"}
            </p>
          </div>
        </div>

        {/* Account section */}
        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2">Account</p>

          <Link to="/profile/change-password">
            <div className="flex items-center justify-between px-3 py-3 rounded-sm border border-border bg-card hover:border-primary/25 hover:bg-card/60 transition-all duration-150 group">
              <div className="flex items-center gap-3">
                <KeyRound className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs font-medium text-foreground">Change password</p>
                  <p className="text-[11px] text-muted-foreground/70 font-mono">Update your account password</p>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all duration-150 shrink-0" />
            </div>
          </Link>

          <Link to="/">
            <div className="flex items-center justify-between px-3 py-3 rounded-sm border border-border bg-card hover:border-primary/25 hover:bg-card/60 transition-all duration-150 group">
              <div className="flex items-center gap-3">
                <Bookmark className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs font-medium text-foreground">View bookmarks</p>
                  <p className="text-[11px] text-muted-foreground/70 font-mono">{bookmarkCount} saved</p>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all duration-150 shrink-0" />
            </div>
          </Link>

          <Link to="/logout">
            <div className="flex items-center justify-between px-3 py-3 rounded-sm border border-border bg-card hover:border-destructive/25 hover:bg-card/60 transition-all duration-150 group mt-1">
              <div className="flex items-center gap-3">
                <LogOut className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <p className="text-xs font-medium text-foreground group-hover:text-destructive transition-colors">Sign out</p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-destructive/50 group-hover:translate-x-0.5 transition-all duration-150 shrink-0" />
            </div>
          </Link>
        </div>

        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors font-mono w-fit"
        >
          <ArrowLeft className="w-3 h-3" />
          Back
        </Link>
      </div>
    </div>
  );
}
