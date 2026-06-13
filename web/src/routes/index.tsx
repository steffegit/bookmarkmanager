import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useHotkeys } from "react-hotkeys-hook";
import AddBookmarkMenu from "@/components/bookmark/AddBookmarkMenu";
import { BookmarkCard } from "@/components/bookmark/BookmarkCard";
import { BrandIconGrid } from "@/components/BrandIconGrid";
import { type Bookmark, fetchBookmarks } from "@/data/bookmarks";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ["bookmarks"],
    queryFn: fetchBookmarks,
    enabled: isAuthenticated,
  });

  useHotkeys("s", () => navigate({ to: "/login" }), {
    enabled: !isAuthenticated && !authLoading,
    preventDefault: true,
  });
  useHotkeys("c", () => navigate({ to: "/signup" }), {
    enabled: !isAuthenticated && !authLoading,
    preventDefault: true,
  });

  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
          <span className="w-1 h-1 rounded-full bg-primary animate-pulse" />
          Loading...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden px-4 py-24">
        <BrandIconGrid />

        <div className="relative text-center max-w-2xl mx-auto flex flex-col items-center gap-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/60 bg-background/60 backdrop-blur text-[11px] text-muted-foreground font-mono mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Early access
          </div>

          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl text-foreground tracking-tight leading-[1.05]">
            Your bookmarks,
            <br />
            <span className="text-primary">organized.</span>
          </h1>

          <p className="text-sm text-muted-foreground max-w-md leading-relaxed font-mono">
            A minimal bookmark manager crafted for speed and clarity. Save
            links, add context, access them anywhere.
          </p>

          <div className="flex gap-3 mt-2">
            <Link
              to="/login"
              className="flex items-center h-9 px-4 text-sm bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 transition-colors font-medium"
            >
              Sign in
              <kbd className="ml-2 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-[3px] bg-white/20 border border-white/30 px-1.5 text-[10px] font-medium text-white/80 leading-none tracking-normal">
                S
              </kbd>
            </Link>
            <Link
              to="/signup"
              className="flex items-center h-9 px-4 text-sm border border-border bg-background text-foreground rounded-sm hover:bg-foreground/[0.04] hover:border-border/80 transition-colors"
            >
              Create account
              <kbd className="ml-2 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-[3px] bg-foreground/[0.12] border border-foreground/[0.22] px-1.5 text-[10px] font-medium text-foreground/70 leading-none tracking-normal">
                C
              </kbd>
            </Link>
          </div>

          <div className="flex items-center gap-6 mt-4 text-[11px] text-muted-foreground/50 font-mono">
            <span>⌘K — focus URL bar</span>
            <span className="w-px h-3 bg-border" />
            <span>⌘↵ — add bookmark</span>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
          <span className="w-1 h-1 rounded-full bg-primary animate-pulse" />
          Loading bookmarks...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-xs text-destructive font-mono">
          Error: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-0 pt-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-baseline gap-2">
          <h2 className="text-sm font-semibold text-foreground tracking-tight">
            Bookmarks
          </h2>
          {data && data.length > 0 && (
            <span className="text-xs text-muted-foreground/60 font-mono">
              {data.length} saved
            </span>
          )}
        </div>
      </div>

      <AddBookmarkMenu />

      {data && data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-sm text-muted-foreground/60 font-mono">
            No bookmarks yet. Paste a URL above to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {data?.map((bookmark: Bookmark) => (
            <BookmarkCard key={bookmark.id} bookmark={bookmark} />
          ))}
        </div>
      )}
    </div>
  );
}
