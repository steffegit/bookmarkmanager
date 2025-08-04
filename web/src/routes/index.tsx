import {
  QueryClientProvider,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import AddBookmarkMenu from "@/components/bookmark/AddBookmarkMenu";
import { BookmarkCard } from "@/components/bookmark/BookmarkCard";
import { type Bookmark, fetchBookmarks } from "@/data/bookmarks";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { TypingAnimation } from "@/components/magicui/typing-animation";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ["bookmarks"],
    queryFn: fetchBookmarks,
    enabled: isAuthenticated, // Only fetch if authenticated
  });

  // Show loading while checking auth status
  if (authLoading) return <div>Loading...</div>;

  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-md w-full gap-8">
          <div className="text-center">
            <TypingAnimation className="text-2xl font-bold">
              Welcome to Bookmark Manager
            </TypingAnimation>
            <p className="mt-2 text-sm text-muted-foreground">
              Please sign in to manage your bookmarks
            </p>
          </div>
          <div className="mt-8 gap-4 flex flex-col items-center justify-center w-full">
            <Link to="/login" className="w-full">
              <Button variant="default" className="w-full">
                Sign in
              </Button>
            </Link>
            <Link to="/signup" className="w-full">
              <Button variant="outline" className="w-full">
                Create account
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) return <div>Loading bookmarks...</div>;

  if (error) return <div>Error loading bookmarks: {error.message}</div>;

  return (
    <QueryClientProvider client={queryClient}>
      <div>
        <AddBookmarkMenu />
        <div className="grid grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto container gap-4 px-4 md:px-0 mb-4">
          {data?.map((bookmark: Bookmark) => (
            <BookmarkCard key={bookmark.id} bookmark={bookmark} />
          ))}
        </div>
      </div>
    </QueryClientProvider>
  );
}
