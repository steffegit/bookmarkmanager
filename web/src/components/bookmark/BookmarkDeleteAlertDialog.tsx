import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash } from "lucide-react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Bookmark } from "@/data/bookmarks";
import { BACKEND_URL } from "@/hooks/useAuth";

async function deleteBookmark(id: string): Promise<void> {
	const response = await fetch(`${BACKEND_URL}/api/bookmarks/${id}`, {
		method: "DELETE",
		headers: {
			Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
		},
	});

	if (!response.ok) {
		throw new Error("Failed to delete bookmark");
	}
}

function BookmarkDeleteAlertDialog({
	open,
	setOpen,
	bookmark,
}: {
	open: boolean;
	setOpen: (open: boolean) => void;
	bookmark: Bookmark;
}) {
	const queryClient = useQueryClient();

	// Keyboard shortcuts
	useHotkeys(
		"enter",
		() => {
			if (open && !deleteBookmarkMutation.isPending) {
				deleteBookmarkMutation.mutate();
			}
		},
		{ preventDefault: true, enabled: open },
	);

	useHotkeys(
		"escape",
		() => {
			if (open) {
				setOpen(false);
			}
		},
		{ preventDefault: true, enabled: open },
	);

	const deleteBookmarkMutation = useMutation({
		mutationFn: () => deleteBookmark(bookmark.id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
			setOpen(false);
			toast.success("Bookmark deleted successfully");
		},
		onError: (error) => {
			console.error("Failed to delete bookmark:", error);
			toast.error("Failed to delete bookmark");
		},
	});

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogContent className="border-accent-foreground/10 rounded-md">
				<AlertDialogHeader>
					<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
					<AlertDialogDescription className="tracking-tighter">
						This action cannot be undone. This will{" "}
						<span className="font-black text-destructive">
							permanently delete
						</span>{" "}
						the bookmark: <span className="font-bold">{bookmark.title}</span>.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={() => deleteBookmarkMutation.mutate()}
						disabled={deleteBookmarkMutation.isPending}
						className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
					>
						<Trash className="w-1 h-1 scale-90 -mr-1 text-foreground" />
						{deleteBookmarkMutation.isPending ? "Deleting..." : "Delete"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

export default BookmarkDeleteAlertDialog;
