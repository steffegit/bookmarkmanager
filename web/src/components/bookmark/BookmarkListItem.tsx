import { formatDistanceToNow, parseISO } from "date-fns";
import { ExternalLink } from "lucide-react";
import { useState } from "react";
import type { Bookmark } from "@/data/bookmarks";
import { extractDomain, getFaviconUrl } from "@/lib/utils";
import BookmarkDeleteAlertDialog from "./BookmarkDeleteAlertDialog";
import BookmarkDropdown from "./BookmarkDropdown";
import BookmarkEditDialog from "./BookmarkEditDialog";

export function BookmarkListItem({ bookmark }: { bookmark: Bookmark }) {
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [faviconError, setFaviconError] = useState(false);

	const domain = extractDomain(bookmark.url);
	const relativeDate = bookmark.createdAt
		? formatDistanceToNow(parseISO(bookmark.createdAt), { addSuffix: true })
		: null;

	return (
		<>
			<div className="group flex items-center gap-3 px-3 py-2.5 border-b border-border/60 hover:bg-foreground/[0.025] transition-colors duration-100">
				{/* Favicon */}
				<div className="w-5 h-5 shrink-0 flex items-center justify-center">
					{domain && !faviconError ? (
						<img
							src={getFaviconUrl(domain, 32)}
							alt=""
							width={16}
							height={16}
							loading="lazy"
							decoding="async"
							className="w-4 h-4 object-contain"
							onError={() => setFaviconError(true)}
						/>
					) : (
						<ExternalLink className="w-3.5 h-3.5 text-muted-foreground/40" />
					)}
				</div>

				{/* Title + description — fills available space, truncates */}
				<a
					href={bookmark.url}
					target="_blank"
					rel="noopener noreferrer"
					className="flex-1 min-w-0 overflow-hidden"
				>
					<span className="text-xs font-medium text-foreground hover:text-primary transition-colors duration-100 truncate block leading-snug">
						{bookmark.title || bookmark.url}
					</span>
					{bookmark.description && (
						<span className="text-[11px] text-muted-foreground/60 font-mono truncate block mt-0.5">
							{bookmark.description}
						</span>
					)}
				</a>

				{/* Domain — only on md+ */}
				<span className="hidden md:block text-[10px] text-muted-foreground/40 font-mono shrink-0 tabular-nums">
					{domain}
				</span>

				{/* Date — only on lg+ so it never wraps */}
				{relativeDate && (
					<span className="hidden lg:block text-[10px] text-muted-foreground/30 font-mono shrink-0 whitespace-nowrap tabular-nums">
						{relativeDate}
					</span>
				)}

				{/* Actions — visible on hover / always on mobile */}
				<div className="shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-150">
					<BookmarkDropdown
						bookmark={bookmark}
						onEdit={() => setIsEditDialogOpen(true)}
						onDelete={() => setIsDeleteDialogOpen(true)}
					/>
				</div>
			</div>

			<BookmarkEditDialog
				open={isEditDialogOpen}
				setOpen={setIsEditDialogOpen}
				bookmark={bookmark}
			/>
			<BookmarkDeleteAlertDialog
				open={isDeleteDialogOpen}
				setOpen={setIsDeleteDialogOpen}
				bookmark={bookmark}
			/>
		</>
	);
}
