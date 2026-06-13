import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LayoutGrid, LayoutList, Search, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { BrandIconGrid } from "@/components/BrandIconGrid";
import AddBookmarkMenu from "@/components/bookmark/AddBookmarkMenu";
import { BookmarkCard } from "@/components/bookmark/BookmarkCard";
import { BookmarkListItem } from "@/components/bookmark/BookmarkListItem";
import { type Bookmark, fetchBookmarks } from "@/data/bookmarks";
import { useAuth } from "@/hooks/useAuth";
import { useSettings } from "@/hooks/useSettings";

export const Route = createFileRoute("/")({
	component: App,
});

function sortBookmarks(bookmarks: Bookmark[], sortBy: string): Bookmark[] {
	return [...bookmarks].sort((a, b) => {
		if (sortBy === "alphabetical") {
			return (a.title || a.url).localeCompare(b.title || b.url);
		}
		const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
		const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
		return sortBy === "oldest" ? dateA - dateB : dateB - dateA;
	});
}

function filterBookmarks(bookmarks: Bookmark[], query: string): Bookmark[] {
	if (!query) return bookmarks;
	const lq = query.toLowerCase();
	return bookmarks.filter(
		(b) =>
			b.title?.toLowerCase().includes(lq) ||
			b.url.toLowerCase().includes(lq) ||
			b.description?.toLowerCase().includes(lq),
	);
}

const GRID_COLS: Record<number, string> = {
	2: "grid-cols-1 sm:grid-cols-2",
	3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
	4: "grid-cols-2 lg:grid-cols-4",
};

function App() {
	const navigate = useNavigate();
	const { isAuthenticated, isLoading: authLoading } = useAuth();
	const { settings, update } = useSettings();
	const [searchQuery, setSearchQuery] = useState("");
	const searchRef = useRef<HTMLInputElement>(null);

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
	useHotkeys("ctrl+f, meta+f", () => searchRef.current?.focus(), {
		preventDefault: true,
		enabled: isAuthenticated,
	});
	useHotkeys(
		"escape",
		() => {
			if (searchQuery) setSearchQuery("");
			searchRef.current?.blur();
		},
		{ enabled: isAuthenticated },
	);

	const bookmarks: Bookmark[] = data ?? [];

	const displayed = useMemo(() => {
		const sorted = sortBookmarks(bookmarks, settings.sortBy);
		return filterBookmarks(sorted, searchQuery);
	}, [bookmarks, settings.sortBy, searchQuery]);

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
		<div className="px-4 sm:px-6 lg:px-10 pt-5">
			{/* Toolbar */}
			<div className="flex items-center justify-between mb-5 gap-3">
				<div className="flex items-baseline gap-2">
					<h2 className="text-sm font-semibold text-foreground tracking-tight">
						Bookmarks
					</h2>
					{bookmarks.length > 0 && (
						<span className="text-xs text-muted-foreground/60 font-mono">
							{searchQuery
								? `${displayed.length} of ${bookmarks.length}`
								: `${bookmarks.length} saved`}
						</span>
					)}
				</div>

				<div className="flex items-center gap-1.5 ml-auto">
					{/* Search */}
					<div className="relative">
						<Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground/40 pointer-events-none" />
						<input
							ref={searchRef}
							type="text"
							placeholder="Search..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="h-7 pl-6 pr-6 text-xs font-mono bg-card border border-border rounded-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/50 transition-colors w-36 focus:w-52"
							style={{ transition: "width 0.2s ease" }}
						/>
						{searchQuery && (
							<button
								type="button"
								onClick={() => setSearchQuery("")}
								className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
							>
								<X className="w-3 h-3" />
							</button>
						)}
					</div>

					{/* Sort */}
					<select
						value={settings.sortBy}
						onChange={(e) =>
							update({
								sortBy: e.target.value as "newest" | "oldest" | "alphabetical",
							})
						}
						className="h-7 px-2 text-[11px] font-mono bg-card border border-border rounded-sm text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors appearance-none cursor-pointer hover:text-foreground hover:border-border/80"
					>
						<option value="newest">Newest</option>
						<option value="oldest">Oldest</option>
						<option value="alphabetical">A–Z</option>
					</select>

					<div className="w-px h-4 bg-border" />

					{/* View toggle */}
					<button
						type="button"
						onClick={() =>
							update({
								viewMode: settings.viewMode === "grid" ? "list" : "grid",
							})
						}
						className="w-7 h-7 flex items-center justify-center rounded-sm border border-border text-muted-foreground hover:text-foreground hover:bg-foreground/[0.04] transition-all duration-150"
						title={
							settings.viewMode === "grid"
								? "Switch to list view"
								: "Switch to grid view"
						}
					>
						{settings.viewMode === "grid" ? (
							<LayoutList className="w-3.5 h-3.5" />
						) : (
							<LayoutGrid className="w-3.5 h-3.5" />
						)}
					</button>
				</div>
			</div>

			<AddBookmarkMenu />

			{displayed.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-24 text-center gap-2">
					<p className="text-sm text-muted-foreground/60 font-mono">
						{searchQuery
							? `No bookmarks match "${searchQuery}"`
							: "No bookmarks yet. Paste a URL above to get started."}
					</p>
					{searchQuery && (
						<button
							type="button"
							onClick={() => setSearchQuery("")}
							className="text-xs text-primary/70 hover:text-primary transition-colors font-mono"
						>
							Clear search
						</button>
					)}
				</div>
			) : settings.viewMode === "list" ? (
				<div className="border border-border rounded-sm overflow-hidden mb-8">
					{displayed.map((bookmark: Bookmark) => (
						<BookmarkListItem key={bookmark.id} bookmark={bookmark} />
					))}
				</div>
			) : (
				<div
					className={`grid gap-3 mb-8 ${GRID_COLS[settings.gridColumns] ?? GRID_COLS[4]}`}
				>
					{displayed.map((bookmark: Bookmark) => (
						<BookmarkCard key={bookmark.id} bookmark={bookmark} />
					))}
				</div>
			)}
		</div>
	);
}
