import {
	QueryClientProvider,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import AddBookmarkMenu from "@/components/bookmark/AddBookmarkMenu";
import { BookmarkCard } from "@/components/bookmark/BookmarkCard";
import { type Bookmark, fetchBookmarks } from "@/data/bookmarks";

export const Route = createFileRoute("/")({
	component: App,
});

function App() {
	const queryClient = useQueryClient();

	const { data, isLoading, error } = useQuery({
		queryKey: ["bookmarks"],
		queryFn: fetchBookmarks,
	});
	if (isLoading) return <div>Loading...</div>;
	if (error) return <div>Error: {error.message}</div>;

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
