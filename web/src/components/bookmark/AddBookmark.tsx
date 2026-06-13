import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { BACKEND_URL } from "@/hooks/useAuth";

const URL_RE = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(:\d+)?(\/\S*)?$/i;

async function postBookmark(url: string) {
	const token = localStorage.getItem("auth_token");
	const res = await fetch(`${BACKEND_URL}/api/bookmarks`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({ url, title: null, description: null }),
	});
	if (!res.ok) throw new Error("Failed to add bookmark");
}

export function AddBookmark() {
	const queryClient = useQueryClient();
	const [url, setUrl] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);

	const mutation = useMutation({
		mutationFn: postBookmark,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
			toast.success("Bookmark added");
			setUrl("");
		},
		onError: () => toast.error("Failed to add bookmark"),
	});

	useHotkeys("ctrl+k, meta+k", () => inputRef.current?.focus(), {
		preventDefault: true,
	});

	function submit(e: React.FormEvent) {
		e.preventDefault();
		const trimmed = url.trim();
		if (!trimmed) return;
		if (!URL_RE.test(trimmed)) {
			toast.error("Please enter a valid URL");
			return;
		}
		mutation.mutate(trimmed);
	}

	return (
		<form onSubmit={submit} className="relative">
			<input
				ref={inputRef}
				type="text"
				value={url}
				onChange={(e) => setUrl(e.target.value)}
				placeholder="Paste a URL to save…"
				className="w-full h-9 pl-3 pr-28 text-xs font-mono bg-card border border-border rounded-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/50 transition-colors"
			/>
			<kbd className="absolute right-[4.5rem] top-1/2 -translate-y-1/2 hidden sm:inline-flex h-4 items-center rounded-[3px] bg-foreground/[0.07] border border-foreground/[0.1] px-1 text-[9px] text-muted-foreground/50 font-mono pointer-events-none">
				⌘K
			</kbd>
			<button
				type="submit"
				disabled={mutation.isPending || !url.trim()}
				className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1 h-6 px-2 text-[11px] font-medium bg-primary text-primary-foreground rounded-[3px] hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
			>
				<Plus className="w-3 h-3" />
				Add
			</button>
		</form>
	);
}
