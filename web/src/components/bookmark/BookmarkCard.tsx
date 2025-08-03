import { Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { useState } from "react";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Bookmark } from "@/data/bookmarks";
import { extractDomain } from "@/lib/utils";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "../ui/card";
import BookmarkDeleteAlertDialog from "./BookmarkDeleteAlertDialog";
import BookmarkDropdown from "./BookmarkDropdown";
import BookmarkEditDialog from "./BookmarkEditDialog";

export function BookmarkCard({ bookmark }: { bookmark: Bookmark }) {
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

	const handleEdit = () => {
		setIsEditDialogOpen(true);
	};

	const handleDelete = () => {
		setIsDeleteDialogOpen(true);
	};

	return (
		<Card className="border-accent-foreground/10 rounded-md p-0 gap-1 overflow-hidden">
			<CardHeader className="p-0 w-full">
				{/* TODO: Add dominant color as background here or some sort of contrast */}
				<Link
					to={bookmark.url}
					target="_blank"
					rel="noopener noreferrer"
					className="flex justify-center items-center bg-gray-100 w-full hover:cursor-pointer"
				>
					{bookmark.ogImageUrl && bookmark.ogImageUrl !== "" ? (
						<img
							src={bookmark.ogImageUrl}
							alt=""
							className="w-86 h-40 object-contain drop-shadow-lg"
						/>
					) : (
						<div className="w-full min-h-40 flex items-center justify-center bg-gradient-to-bl from-white to-secondary">
							<img
								src={`${bookmark.url}/favicon.ico`}
								alt=""
								className="w-20 h-20 object-contain drop-shadow-lg"
							/>
						</div>
					)}
				</Link>
			</CardHeader>
			<CardContent className="px-2 flex-1">
				<div className="flex flex-col gap-1">
					<div className="flex items-start gap-2">
						<TooltipProvider>
							<Tooltip delayDuration={500}>
								<TooltipTrigger asChild>
									<Link
										to={bookmark.url}
										target="_blank"
										rel="noopener noreferrer"
										className="min-w-0 flex-1"
									>
										<CardTitle className="text-sm line-clamp-2 font-bold tracking-tighter hover:text-primary transition-colors text-ellipsis overflow-hidden">
											{bookmark.title}
										</CardTitle>
									</Link>
								</TooltipTrigger>
								<TooltipContent className="max-w-xs p-2 rounded-md bg-secondary border border-accent-foreground/10 text-foreground shadow-sm">
									<p className="text-xs tracking-tighter">{bookmark.title}</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
						<BookmarkDropdown
							bookmark={bookmark}
							onEdit={handleEdit}
							onDelete={handleDelete}
						/>
					</div>
					<p className="tracking-tighter text-sm font-light line-clamp-3">
						{bookmark.description}
					</p>
				</div>
			</CardContent>
			<CardFooter className="px-2 pb-2">
				<Link
					to={bookmark.url}
					target="_blank"
					rel="noopener noreferrer"
					className="text-xs text-muted-foreground/40 hover:text-muted-foreground/60 tracking-tighter flex gap-1 items-center"
				>
					{extractDomain(bookmark.url)}
					<ExternalLink className="w-3 h-3 opacity-60" />
				</Link>
			</CardFooter>
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
		</Card>
	);
}
