import { MoreHorizontal, Pencil, Share2, Trash } from "lucide-react";
import { useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Bookmark } from "@/data/bookmarks";

function onShare(bookmark: Bookmark) {
	navigator.clipboard.writeText(bookmark.url);
	toast.success("Copied to clipboard");
}

function BookmarkDropdown({
	bookmark,
	onEdit,
	onDelete,
}: {
	bookmark: Bookmark;
	onEdit?: () => void;
	onDelete?: () => void;
}) {
	const [isOpen, setIsOpen] = useState(false);
	const triggerRef = useRef<HTMLButtonElement>(null);

	useHotkeys(
		"meta+e",
		() => {
			if (isOpen) {
				onEdit?.();
				setIsOpen(false);
			}
		},
		{ preventDefault: true, enabled: isOpen },
	);

	useHotkeys(
		"meta+c",
		() => {
			if (isOpen) {
				onShare(bookmark);
				setIsOpen(false);
			}
		},
		{ preventDefault: true, enabled: isOpen },
	);

	useHotkeys(
		"meta+shift+d",
		() => {
			if (isOpen) {
				onDelete?.();
				setIsOpen(false);
			}
		},
		{ preventDefault: true, enabled: isOpen },
	);

	return (
		<DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
			<DropdownMenuTrigger
				ref={triggerRef}
				className="hover:cursor-pointer hover:bg-accent-foreground/10 rounded-md p-1 outline-none"
			>
				<MoreHorizontal className="w-4 h-4" />
			</DropdownMenuTrigger>
			<DropdownMenuContent
				className="rounded-md border-accent-foreground/20 min-w-36"
				align="start"
			>
				<DropdownMenuItem onClick={onEdit}>
					<Pencil className="w-1 h-1 scale-90 -mr-1" />
					Edit
					<DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => onShare(bookmark)}>
					<Share2 className="w-1 h-1 scale-90 -mr-1" />
					Share
					<DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={onDelete}
					className="text-destructive focus:text-destructive focus:bg-destructive/10"
				>
					<Trash className="w-1 h-1 scale-90 -mr-1 text-destructive opacity-80" />
					Delete
					<DropdownMenuShortcut>⇧⌘D</DropdownMenuShortcut>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export default BookmarkDropdown;
