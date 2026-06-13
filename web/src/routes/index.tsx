import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
	Check,
	ChevronDown,
	Download,
	FileCode2,
	FileJson2,
	FolderOpen,
	FolderPlus,
	Inbox,
	Layers,
	Pencil,
	Search,
	Sparkles,
	Trash2,
	X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { useMediaQuery } from "usehooks-ts";
import { BrandIconGrid } from "@/components/BrandIconGrid";
import { AddBookmark } from "@/components/bookmark/AddBookmark";
import { BookmarkCard } from "@/components/bookmark/BookmarkCard";
import { BookmarkListItem } from "@/components/bookmark/BookmarkListItem";
import { type Bookmark, fetchBookmarks } from "@/data/bookmarks";
import { BACKEND_URL, useAuth } from "@/hooks/useAuth";
import { type Folder, useFolders } from "@/hooks/useFolders";
import { useSettings } from "@/hooks/useSettings";
import { exportAsJSON, exportAsNetscapeHTML } from "@/lib/export";

const GRID_COLS: Record<number, string> = {
	2: "grid-cols-1 sm:grid-cols-2",
	3: "grid-cols-2 sm:grid-cols-3",
	4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
};

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

export const Route = createFileRoute("/")({
	component: App,
});

type ActiveView = "all" | "unassigned" | string; // string = folderId

// ── Folder sidebar item ──────────────────────────────────────────────────────

function FolderItem({
	folder,
	count,
	isActive,
	isDragOver,
	onSelect,
	onDragOver,
	onDragLeave,
	onDrop,
	onRename,
	onDelete,
	onExport,
}: {
	folder: Folder;
	count: number;
	isActive: boolean;
	isDragOver: boolean;
	onSelect: () => void;
	onDragOver: (e: React.DragEvent) => void;
	onDragLeave: () => void;
	onDrop: (e: React.DragEvent) => void;
	onRename: (name: string) => void;
	onDelete: () => void;
	onExport: (format: "html" | "json") => void;
}) {
	const [editing, setEditing] = useState(false);
	const [draft, setDraft] = useState(folder.name);
	const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	function commitRename() {
		if (draft.trim() && draft.trim() !== folder.name) {
			onRename(draft.trim());
		} else {
			setDraft(folder.name);
		}
		setEditing(false);
	}

	useEffect(() => {
		if (editing) inputRef.current?.focus();
	}, [editing]);

	return (
		<li
			className={`group/folder relative flex items-center gap-2 px-2.5 py-2 rounded-sm text-xs transition-all duration-100 border list-none ${
				isDragOver
					? "border-primary/50 bg-primary/[0.08] text-primary"
					: isActive
						? "border-primary/20 bg-primary/10 text-primary"
						: "border-transparent text-muted-foreground hover:text-foreground hover:bg-foreground/[0.04]"
			}`}
			onDragOver={onDragOver}
			onDragLeave={onDragLeave}
			onDrop={onDrop}
			onContextMenu={(e) => {
				e.preventDefault();
				setMenu({ x: e.clientX, y: e.clientY });
			}}
		>
			<FolderOpen
				className={`w-3.5 h-3.5 shrink-0 ${isDragOver ? "text-primary" : isActive ? "text-primary" : "text-muted-foreground/60"}`}
			/>

			{editing ? (
				<input
					ref={inputRef}
					value={draft}
					onChange={(e) => setDraft(e.target.value)}
					onBlur={commitRename}
					onKeyDown={(e) => {
						if (e.key === "Enter") commitRename();
						if (e.key === "Escape") {
							setDraft(folder.name);
							setEditing(false);
						}
					}}
					className="flex-1 min-w-0 bg-transparent outline-none text-xs text-foreground"
				/>
			) : (
				<button
					type="button"
					onClick={onSelect}
					className="flex-1 min-w-0 text-left truncate"
				>
					{folder.name}
				</button>
			)}

			<span
				className={`text-[10px] font-mono shrink-0 ${isActive ? "text-primary/70" : "text-muted-foreground/40"}`}
			>
				{count}
			</span>

			{!editing && (
				<div className="hidden group-hover/folder:flex items-center gap-0.5 shrink-0">
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							const r = e.currentTarget.getBoundingClientRect();
							setMenu({ x: r.left, y: r.bottom + 4 });
						}}
						title="Export folder"
						className="w-4 h-4 flex items-center justify-center text-muted-foreground/50 hover:text-foreground transition-colors"
					>
						<Download className="w-2.5 h-2.5" />
					</button>
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							setDraft(folder.name);
							setEditing(true);
						}}
						className="w-4 h-4 flex items-center justify-center text-muted-foreground/50 hover:text-foreground transition-colors"
					>
						<Pencil className="w-2.5 h-2.5" />
					</button>
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							onDelete();
						}}
						className="w-4 h-4 flex items-center justify-center text-muted-foreground/50 hover:text-destructive transition-colors"
					>
						<Trash2 className="w-2.5 h-2.5" />
					</button>
				</div>
			)}

			{menu &&
				createPortal(
					<>
						<button
							type="button"
							aria-label="Close menu"
							className="fixed inset-0 z-40 cursor-default"
							onClick={() => setMenu(null)}
							onContextMenu={(e) => {
								e.preventDefault();
								setMenu(null);
							}}
						/>
						<div
							className="fixed z-50 min-w-44 p-1 rounded-sm border border-border bg-popover shadow-lg flex flex-col"
							style={{ top: menu.y, left: menu.x }}
						>
							<div className="px-2 py-1 text-[10px] font-mono text-muted-foreground/50 truncate">
								Export "{folder.name}"
							</div>
							<button
								type="button"
								onClick={() => {
									onExport("html");
									setMenu(null);
								}}
								className="flex items-center gap-2 px-2 py-1.5 text-xs text-foreground hover:bg-foreground/[0.06] rounded-[3px] transition-colors text-left"
							>
								<FileCode2 className="w-3 h-3 text-primary" />
								Export as HTML
							</button>
							<button
								type="button"
								onClick={() => {
									onExport("json");
									setMenu(null);
								}}
								className="flex items-center gap-2 px-2 py-1.5 text-xs text-foreground hover:bg-foreground/[0.06] rounded-[3px] transition-colors text-left"
							>
								<FileJson2 className="w-3 h-3 text-muted-foreground" />
								Export as JSON
							</button>
						</div>
					</>,
					document.body,
				)}
		</li>
	);
}

// ── New folder inline input ──────────────────────────────────────────────────

function NewFolderInput({
	onConfirm,
	onCancel,
}: {
	onConfirm: (name: string) => void;
	onCancel: () => void;
}) {
	const [value, setValue] = useState("");
	const ref = useRef<HTMLInputElement>(null);

	useEffect(() => {
		ref.current?.focus();
	}, []);

	function confirm() {
		if (value.trim()) onConfirm(value.trim());
		else onCancel();
	}

	return (
		<div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm border border-primary/30 bg-primary/[0.06]">
			<FolderOpen className="w-3.5 h-3.5 shrink-0 text-primary/60" />
			<input
				ref={ref}
				value={value}
				onChange={(e) => setValue(e.target.value)}
				onKeyDown={(e) => {
					if (e.key === "Enter") confirm();
					if (e.key === "Escape") onCancel();
				}}
				onBlur={confirm}
				placeholder="Folder name..."
				className="flex-1 min-w-0 bg-transparent outline-none text-xs text-foreground placeholder:text-muted-foreground/40"
			/>
			<button
				type="button"
				onMouseDown={(e) => {
					e.preventDefault();
					confirm();
				}}
				className="text-primary/60 hover:text-primary transition-colors"
			>
				<Check className="w-3 h-3" />
			</button>
			<button
				type="button"
				onMouseDown={(e) => {
					e.preventDefault();
					onCancel();
				}}
				className="text-muted-foreground/40 hover:text-muted-foreground transition-colors"
			>
				<X className="w-3 h-3" />
			</button>
		</div>
	);
}

// ── Unauthenticated landing ──────────────────────────────────────────────────

function Landing() {
	const navigate = useNavigate();

	useHotkeys("s", () => navigate({ to: "/login" }), { preventDefault: true });
	useHotkeys("c", () => navigate({ to: "/signup" }), { preventDefault: true });

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
					A minimal bookmark manager crafted for speed and clarity. Save links,
					sort them into collections, access them anywhere.
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
					<span>S — search</span>
				</div>
			</div>
		</div>
	);
}

// ── Main authenticated view ──────────────────────────────────────────────────

function App() {
	const { isAuthenticated, isLoading: authLoading } = useAuth();
	const { settings } = useSettings();

	const { data, isLoading } = useQuery({
		queryKey: ["bookmarks"],
		queryFn: fetchBookmarks,
		enabled: isAuthenticated,
	});

	const {
		folders,
		assignments,
		createFolder,
		renameFolder,
		deleteFolder,
		assignBookmark,
		applyAISuggestions,
		getFolderCount,
		getUnassignedCount,
	} = useFolders();

	const bookmarks: Bookmark[] = data ?? [];
	const allIds = bookmarks.map((b) => b.id);

	const [activeView, setActiveView] = useState<ActiveView>("all");
	const [dragOverTarget, setDragOverTarget] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [showNewFolder, setShowNewFolder] = useState(false);
	const [isAILoading, setIsAILoading] = useState(false);
	const [mobileFoldersOpen, setMobileFoldersOpen] = useState(false);
	const searchRef = useRef<HTMLInputElement>(null);
	const isDesktop = useMediaQuery("(min-width: 768px)");

	useHotkeys("s", () => searchRef.current?.focus(), {
		preventDefault: true,
		enabled: isAuthenticated,
	});
	useHotkeys(
		"escape",
		() => {
			if (searchQuery) setSearchQuery("");
			searchRef.current?.blur();
		},
		{ enabled: isAuthenticated, enableOnFormTags: true },
	);

	const viewBookmarks = sortBookmarks(
		bookmarks.filter((b) => {
			const matchesView =
				activeView === "all"
					? true
					: activeView === "unassigned"
						? !assignments[b.id]
						: assignments[b.id] === activeView;

			const matchesSearch = searchQuery
				? b.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
					b.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
					b.description?.toLowerCase().includes(searchQuery.toLowerCase())
				: true;

			return matchesView && matchesSearch;
		}),
		settings.sortBy,
	);

	function handleDragOver(e: React.DragEvent, target: string) {
		e.preventDefault();
		e.dataTransfer.dropEffect = "move";
		setDragOverTarget(target);
	}

	function handleDrop(e: React.DragEvent, folderId: string | null) {
		e.preventDefault();
		setDragOverTarget(null);
		const bookmarkId = e.dataTransfer.getData("bookmarkId");
		if (!bookmarkId) return;
		assignBookmark(bookmarkId, folderId);
		toast.success(
			folderId
				? `Moved to "${folders.find((f) => f.id === folderId)?.name}"`
				: "Removed from folder",
		);
	}

	async function handleAICategorize() {
		if (!bookmarks.length) {
			toast.error("No bookmarks to categorize");
			return;
		}
		setIsAILoading(true);
		const toastId = toast.loading("AI is analyzing your bookmarks...");
		try {
			const token = localStorage.getItem("auth_token");
			const res = await fetch(`${BACKEND_URL}/api/bookmarks/categorize`, {
				method: "POST",
				headers: { Authorization: `Bearer ${token}` },
			});
			if (!res.ok) {
				const err = await res.json().catch(() => ({}));
				throw new Error(
					(err as { message?: string }).message || `Error ${res.status}`,
				);
			}
			const result = (await res.json()) as {
				folders: { name: string; bookmarkIds: string[] }[];
			};
			applyAISuggestions(result.folders, folders);
			toast.dismiss(toastId);
			toast.success(
				`Created ${result.folders.length} folder${result.folders.length === 1 ? "" : "s"} from AI suggestions`,
			);
		} catch (err) {
			toast.dismiss(toastId);
			toast.error(
				err instanceof Error ? err.message : "AI categorization failed",
			);
		} finally {
			setIsAILoading(false);
		}
	}

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
		return <Landing />;
	}

	const sidebarLinkCls = (active: boolean, dragOver = false) =>
		`flex items-center justify-between px-2.5 py-2 rounded-sm text-xs transition-all duration-100 border w-full text-left ${
			dragOver
				? "border-primary/40 bg-primary/[0.08] text-primary"
				: active
					? "border-primary/20 bg-primary/10 text-primary"
					: "border-transparent text-muted-foreground hover:text-foreground hover:bg-foreground/[0.04]"
		}`;

	// Selecting a view also collapses the mobile folder panel.
	const selectView = (v: ActiveView) => {
		setActiveView(v);
		setMobileFoldersOpen(false);
	};

	const activeLabel =
		activeView === "all"
			? "All bookmarks"
			: activeView === "unassigned"
				? "Unassigned"
				: (folders.find((f) => f.id === activeView)?.name ?? "Folders");

	const folderNav = (
		<>
			<button
				type="button"
				className={sidebarLinkCls(activeView === "all")}
				onClick={() => selectView("all")}
			>
				<span className="flex items-center gap-2">
					<Layers className="w-3.5 h-3.5" />
					All bookmarks
				</span>
				<span className="text-[10px] font-mono opacity-50">
					{bookmarks.length}
				</span>
			</button>

			<button
				type="button"
				className={sidebarLinkCls(
					activeView === "unassigned",
					dragOverTarget === "unassigned",
				)}
				onClick={() => selectView("unassigned")}
				onDragOver={(e) => handleDragOver(e, "unassigned")}
				onDragLeave={() => setDragOverTarget(null)}
				onDrop={(e) => handleDrop(e, null)}
			>
				<span className="flex items-center gap-2">
					<Inbox className="w-3.5 h-3.5" />
					Unassigned
				</span>
				<span className="text-[10px] font-mono opacity-50">
					{getUnassignedCount(allIds)}
				</span>
			</button>

			{folders.length > 0 && <div className="my-1 border-t border-border/50" />}

			{folders.map((folder) => (
				<FolderItem
					key={folder.id}
					folder={folder}
					count={getFolderCount(folder.id, allIds)}
					isActive={activeView === folder.id}
					isDragOver={dragOverTarget === folder.id}
					onSelect={() => selectView(folder.id)}
					onDragOver={(e) => handleDragOver(e, folder.id)}
					onDragLeave={() => setDragOverTarget(null)}
					onDrop={(e) => handleDrop(e, folder.id)}
					onRename={(name) => renameFolder(folder.id, name)}
					onDelete={() => {
						deleteFolder(folder.id);
						if (activeView === folder.id) setActiveView("all");
						toast.success(`Deleted folder "${folder.name}"`);
					}}
					onExport={(format) => {
						const inFolder = bookmarks.filter(
							(b) => assignments[b.id] === folder.id,
						);
						if (inFolder.length === 0) {
							toast.error(`"${folder.name}" is empty`);
							return;
						}
						const groups = [{ name: folder.name, bookmarks: inFolder }];
						if (format === "json") exportAsJSON(groups, folder.name);
						else exportAsNetscapeHTML(groups, folder.name);
						toast.success(
							`Exported ${inFolder.length} bookmark${inFolder.length === 1 ? "" : "s"} from "${folder.name}"`,
						);
					}}
				/>
			))}

			{showNewFolder && (
				<NewFolderInput
					onConfirm={(name) => {
						const folder = createFolder(name);
						setShowNewFolder(false);
						setActiveView(folder.id);
						toast.success(`Created folder "${name}"`);
					}}
					onCancel={() => setShowNewFolder(false)}
				/>
			)}

			{!showNewFolder && (
				<button
					type="button"
					onClick={() => setShowNewFolder(true)}
					className="flex items-center gap-2 px-2.5 py-2 rounded-sm text-xs text-muted-foreground/50 hover:text-muted-foreground hover:bg-foreground/[0.04] transition-all duration-100 border border-transparent border-dashed hover:border-border"
				>
					<FolderPlus className="w-3.5 h-3.5" />
					New folder
				</button>
			)}
		</>
	);

	return (
		<div className="px-4 sm:px-6 lg:px-10 pt-5 pb-12 flex flex-col gap-5">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-baseline gap-2">
					<h2 className="text-sm font-semibold text-foreground tracking-tight">
						Bookmarks
					</h2>
					{!isLoading && (
						<span className="text-xs text-muted-foreground/60 font-mono">
							{bookmarks.length} bookmarks · {folders.length} folders
						</span>
					)}
				</div>

				<button
					type="button"
					onClick={handleAICategorize}
					disabled={isAILoading || bookmarks.length === 0}
					className="flex items-center gap-1.5 h-7 px-3 text-xs rounded-sm border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/[0.06] transition-all duration-150 font-mono disabled:opacity-40 disabled:cursor-not-allowed"
				>
					<Sparkles className="w-3 h-3" />
					{isAILoading ? "Thinking..." : "AI categorize"}
				</button>
			</div>

			<div className="flex flex-col md:flex-row gap-4 md:gap-5 min-h-0">
				{/* ── Folder navigation ── */}
				{isDesktop ? (
					<div className="w-48 shrink-0 flex flex-col gap-1">{folderNav}</div>
				) : (
					<div className="flex flex-col gap-2">
						<button
							type="button"
							onClick={() => setMobileFoldersOpen((o) => !o)}
							className="flex items-center justify-between w-full h-9 px-3 rounded-sm border border-border bg-card text-xs text-foreground"
						>
							<span className="flex items-center gap-2 min-w-0">
								<FolderOpen className="w-3.5 h-3.5 text-primary shrink-0" />
								<span className="font-medium truncate">{activeLabel}</span>
							</span>
							<ChevronDown
								className={`w-3.5 h-3.5 text-muted-foreground/60 shrink-0 transition-transform duration-150 ${mobileFoldersOpen ? "rotate-180" : ""}`}
							/>
						</button>
						{mobileFoldersOpen && (
							<div className="flex flex-col gap-1 p-1 rounded-sm border border-border bg-card/40">
								{folderNav}
							</div>
						)}
					</div>
				)}

				{/* ── Main content ── */}
				<div className="flex-1 min-w-0 flex flex-col gap-4">
					{/* Add bookmark */}
					<AddBookmark />

					{/* Search */}
					<div className="relative max-w-sm">
						<Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground/40 pointer-events-none" />
						<input
							ref={searchRef}
							type="text"
							placeholder="Search bookmarks..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full h-8 pl-7 pr-12 text-xs font-mono bg-card border border-border rounded-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/50 transition-colors"
						/>
						{searchQuery ? (
							<button
								type="button"
								onClick={() => setSearchQuery("")}
								className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
							>
								<X className="w-3 h-3" />
							</button>
						) : (
							<kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:inline-flex h-4 min-w-4 items-center justify-center rounded-[3px] bg-foreground/[0.07] border border-foreground/[0.1] px-1 text-[9px] text-muted-foreground/50 font-mono pointer-events-none">
								S
							</kbd>
						)}
					</div>

					{folders.length > 0 && viewBookmarks.length > 0 && (
						<p className="text-[10px] text-muted-foreground/30 font-mono">
							Drag bookmarks onto folders to organise them
						</p>
					)}

					{isLoading ? (
						<div className="flex items-center gap-2 text-xs text-muted-foreground font-mono py-16 justify-center">
							<span className="w-1 h-1 rounded-full bg-primary animate-pulse" />
							Loading...
						</div>
					) : viewBookmarks.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
							<p className="text-sm text-muted-foreground/50 font-mono">
								{searchQuery
									? "No bookmarks match your search."
									: activeView === "unassigned"
										? "All bookmarks are organised into folders."
										: activeView === "all"
											? "No bookmarks yet. Paste a URL above to get started."
											: "This folder is empty. Drag bookmarks here."}
							</p>
						</div>
					) : settings.viewMode === "list" ? (
						<ul className="border border-border rounded-sm overflow-hidden list-none p-0 m-0">
							{viewBookmarks.map((bookmark) => (
								<li
									key={bookmark.id}
									draggable
									onDragStart={(e) => {
										e.dataTransfer.setData("bookmarkId", bookmark.id);
										e.dataTransfer.effectAllowed = "move";
									}}
									className="cursor-grab active:cursor-grabbing"
								>
									<BookmarkListItem bookmark={bookmark} />
								</li>
							))}
						</ul>
					) : (
						<ul
							className={`grid gap-3 list-none p-0 m-0 ${GRID_COLS[settings.gridColumns] ?? GRID_COLS[4]}`}
						>
							{viewBookmarks.map((bookmark) => (
								<li
									key={bookmark.id}
									draggable
									onDragStart={(e) => {
										e.dataTransfer.setData("bookmarkId", bookmark.id);
										e.dataTransfer.effectAllowed = "move";
									}}
									className="cursor-grab active:cursor-grabbing"
								>
									<BookmarkCard bookmark={bookmark} />
								</li>
							))}
						</ul>
					)}
				</div>
			</div>
		</div>
	);
}
