import { ExternalLink } from "lucide-react";
import { useState } from "react";
import type { Bookmark } from "@/data/bookmarks";
import { extractDomain } from "@/lib/utils";
import BookmarkDeleteAlertDialog from "./BookmarkDeleteAlertDialog";
import BookmarkDropdown from "./BookmarkDropdown";
import BookmarkEditDialog from "./BookmarkEditDialog";

export function BookmarkCard({ bookmark }: { bookmark: Bookmark }) {
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [faviconError, setFaviconError] = useState(false);

	const domain = extractDomain(bookmark.url);

	return (
		<div className="group flex flex-col rounded-sm border border-border bg-card overflow-hidden hover:border-primary/25 transition-all duration-200 hover:shadow-md">
			<a
				href={bookmark.url}
				target="_blank"
				rel="noopener noreferrer"
				className="block overflow-hidden"
			>
				<div className="relative w-full aspect-video bg-muted overflow-hidden">
					{bookmark.ogImageUrl && bookmark.ogImageUrl !== "" ? (
						<img
							src={bookmark.ogImageUrl}
							alt=""
							className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
						/>
					) : (
						<div className="w-full h-full flex items-center justify-center">
							{domain && !faviconError ? (
								<img
									src={`https://${domain}/favicon.ico`}
									alt=""
									className="w-8 h-8 object-contain opacity-40"
									onError={() => setFaviconError(true)}
								/>
							) : (
								<div className="w-8 h-8 rounded-sm bg-border/60 flex items-center justify-center">
									<ExternalLink className="w-3.5 h-3.5 text-muted-foreground/40" />
								</div>
							)}
						</div>
					)}
					<div className="absolute inset-0 bg-gradient-to-t from-background/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
				</div>
			</a>

			<div className="flex flex-col gap-1.5 p-3 flex-1">
				<div className="flex items-start gap-1.5">
					<a
						href={bookmark.url}
						target="_blank"
						rel="noopener noreferrer"
						className="flex-1 min-w-0"
					>
						<h3 className="text-xs font-medium line-clamp-2 text-foreground hover:text-primary transition-colors duration-150 leading-snug tracking-tight">
							{bookmark.title}
						</h3>
					</a>
					<div className="shrink-0 -mt-0.5 -mr-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
						<BookmarkDropdown
							bookmark={bookmark}
							onEdit={() => setIsEditDialogOpen(true)}
							onDelete={() => setIsDeleteDialogOpen(true)}
						/>
					</div>
				</div>

				{bookmark.description && (
					<p className="text-[11px] text-muted-foreground/70 line-clamp-2 leading-relaxed tracking-tight">
						{bookmark.description}
					</p>
				)}

				<div className="mt-auto pt-1.5">
					<a
						href={bookmark.url}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-1 text-[10px] text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors duration-150 font-mono tracking-tight"
					>
						{domain}
						<ExternalLink className="w-2.5 h-2.5" />
					</a>
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
		</div>
	);
}
