import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
	Check,
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
import { toast } from "sonner";
import { BookmarkCard } from "@/components/bookmark/BookmarkCard";
import { type Bookmark, fetchBookmarks } from "@/data/bookmarks";
import { BACKEND_URL, useAuth } from "@/hooks/useAuth";
import { type Folder, useFolders } from "@/hooks/useFolders";

export const Route = createFileRoute("/collections")({
	component: CollectionsPage,
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
}) {
	const [editing, setEditing] = useState(false);
	const [draft, setDraft] = useState(folder.name);
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

// ── Main page ────────────────────────────────────────────────────────────────

function CollectionsPage() {
	const navigate = useNavigate();
	const { isAuthenticated, isLoading: authLoading } = useAuth();

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
	const [dragOverTarget, setDragOverTarget] = useState<string | null>(null); // folderId | "unassigned"
	const [searchQuery, setSearchQuery] = useState("");
	const [showNewFolder, setShowNewFolder] = useState(false);
	const [isAILoading, setIsAILoading] = useState(false);

	// Filter bookmarks for current view
	const viewBookmarks = bookmarks.filter((b) => {
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
	});

	// Drag handlers
	function handleDragOver(
		e: React.DragEvent,
		target: string /* folderId | "unassigned" */,
	) {
		e.preventDefault();
		e.dataTransfer.dropEffect = "move";
		setDragOverTarget(target);
	}

	function handleDrop(
		e: React.DragEvent,
		folderId: string | null /* null = unassign */,
	) {
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

	// AI categorize
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
			const data = (await res.json()) as {
				folders: { name: string; bookmarkIds: string[] }[];
			};
			applyAISuggestions(data.folders, folders);
			toast.dismiss(toastId);
			toast.success(
				`Created ${data.folders.length} folder${data.folders.length === 1 ? "" : "s"} from AI suggestions`,
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
		navigate({ to: "/login" });
		return null;
	}

	const sidebarLinkCls = (active: boolean, dragOver = false) =>
		`flex items-center justify-between px-2.5 py-2 rounded-sm text-xs transition-all duration-100 border w-full text-left ${
			dragOver
				? "border-primary/40 bg-primary/[0.08] text-primary"
				: active
					? "border-primary/20 bg-primary/10 text-primary"
					: "border-transparent text-muted-foreground hover:text-foreground hover:bg-foreground/[0.04]"
		}`;

	return (
		<div className="px-4 sm:px-6 lg:px-10 pt-5 pb-12 flex flex-col gap-5">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-baseline gap-2">
					<h2 className="text-sm font-semibold text-foreground tracking-tight">
						Collections
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

			<div className="flex gap-5 min-h-0">
				{/* ── Sidebar ── */}
				<div className="w-48 shrink-0 flex flex-col gap-1">
					{/* All */}
					<button
						type="button"
						className={sidebarLinkCls(activeView === "all")}
						onClick={() => setActiveView("all")}
					>
						<span className="flex items-center gap-2">
							<Layers className="w-3.5 h-3.5" />
							All bookmarks
						</span>
						<span className="text-[10px] font-mono opacity-50">
							{bookmarks.length}
						</span>
					</button>

					{/* Unassigned — drop target to remove from folder */}
					<button
						type="button"
						className={sidebarLinkCls(
							activeView === "unassigned",
							dragOverTarget === "unassigned",
						)}
						onClick={() => setActiveView("unassigned")}
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

					{/* Divider */}
					{folders.length > 0 && (
						<div className="my-1 border-t border-border/50" />
					)}

					{/* Folder list */}
					{folders.map((folder) => (
						<FolderItem
							key={folder.id}
							folder={folder}
							count={getFolderCount(folder.id, allIds)}
							isActive={activeView === folder.id}
							isDragOver={dragOverTarget === folder.id}
							onSelect={() => setActiveView(folder.id)}
							onDragOver={(e) => handleDragOver(e, folder.id)}
							onDragLeave={() => setDragOverTarget(null)}
							onDrop={(e) => handleDrop(e, folder.id)}
							onRename={(name) => renameFolder(folder.id, name)}
							onDelete={() => {
								deleteFolder(folder.id);
								if (activeView === folder.id) setActiveView("all");
								toast.success(`Deleted folder "${folder.name}"`);
							}}
						/>
					))}

					{/* New folder input */}
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

					{/* New folder button */}
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
				</div>

				{/* ── Main content ── */}
				<div className="flex-1 min-w-0 flex flex-col gap-4">
					{/* Search */}
					<div className="relative max-w-sm">
						<Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground/40 pointer-events-none" />
						<input
							type="text"
							placeholder="Search in this view..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full h-8 pl-7 pr-7 text-xs font-mono bg-card border border-border rounded-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/50 transition-colors"
						/>
						{searchQuery && (
							<button
								type="button"
								onClick={() => setSearchQuery("")}
								className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
							>
								<X className="w-3 h-3" />
							</button>
						)}
					</div>

					{/* Drag hint */}
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
											? "No bookmarks yet."
											: "This folder is empty. Drag bookmarks here."}
							</p>
						</div>
					) : (
						<ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 list-none p-0 m-0">
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
