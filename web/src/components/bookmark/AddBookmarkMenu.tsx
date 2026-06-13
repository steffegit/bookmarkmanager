import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { useMediaQuery } from "usehooks-ts";
import z from "zod";
import { Input } from "@/components/ui/input";
import type { bookmarkPostRequest } from "@/data/bookmarks";
import { BACKEND_URL } from "@/hooks/useAuth";
import { Textarea } from "../ui/textarea";

async function addBookmark(bookmark: bookmarkPostRequest) {
	const token = localStorage.getItem("auth_token");

	const response = await fetch(`${BACKEND_URL}/api/bookmarks`, {
		method: "POST",
		body: JSON.stringify({
			url: bookmark.url,
			title: bookmark.title,
			description: bookmark.description,
		}),
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
	});

	if (!response.ok) {
		throw new Error("Failed to add bookmark");
	}
}

const schema = z.object({
	title: z.string(),
	url: z.string(),
	description: z.string(),
});

function AddBookmarkMenu() {
	const queryClient = useQueryClient();
	const [advanced, setAdvanced] = useState(false);
	const urlInputRef = useRef<HTMLInputElement>(null);

	const addBookmarkMutation = useMutation({
		mutationFn: addBookmark,
		onSuccess: async () => {
			queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
			toast.dismiss("add-bookmark");
			toast.success("Bookmark added");
			form.reset();
			setAdvanced(false);
		},
		onError: (error) => {
			console.error("Failed to add bookmark:", error);
			toast.dismiss("add-bookmark");
			toast.error("Failed to add bookmark");
		},
	});

	const form = useForm({
		defaultValues: {
			title: "",
			url: "",
			description: "",
		},
		validators: {
			onBlur: schema,
		},
		onSubmit: async ({ value }) => {
			toast.loading("Adding bookmark...", { id: "add-bookmark" });
			addBookmarkMutation.mutate(value);
		},
	});

	useHotkeys(
		"ctrl+k, meta+k",
		() => {
			urlInputRef.current?.focus();
		},
		{ preventDefault: true },
	);

	useHotkeys(
		"ctrl+enter, meta+enter",
		() => {
			form.handleSubmit();
		},
		{ preventDefault: true },
	);

	const isDesktop = useMediaQuery("(min-width: 768px)");

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
			className="flex flex-col gap-2 mb-5"
		>
			<div className="flex gap-2 items-start">
				<div className="flex-1 relative">
					<form.Field
						name="url"
						validators={{
							onChange: ({ value }) => {
								if (!value) return;
								const urlRegex =
									/^(https?:\/\/)?([\w-]+\.)+[\w-]+(:\d+)?(\/\S*)?$/i;
								if (!urlRegex.test(value)) {
									return "Please enter a valid URL";
								}
							},
						}}
					>
						{(field) => (
							<div>
								<div className="relative flex items-center">
									<Input
										type="text"
										placeholder="Paste a URL to bookmark..."
										className={`w-full text-xs h-8 pr-20 font-mono ${field.state.meta.errors.length > 0 ? "border-destructive/60" : ""}`}
										required
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										ref={urlInputRef}
									/>
									<div className="absolute right-8 flex items-center gap-1 pointer-events-none">
										<kbd className="hidden sm:inline-flex h-4 items-center gap-0.5 rounded-[3px] bg-foreground/[0.07] border border-foreground/[0.1] px-1 text-[9px] text-muted-foreground/60 font-mono">
											⌘K
										</kbd>
									</div>
									<button
										type="button"
										onClick={() => setAdvanced((prev) => !prev)}
										className="absolute right-2 w-5 h-5 flex items-center justify-center text-muted-foreground/50 hover:text-muted-foreground transition-colors"
									>
										<motion.div
											animate={{ rotate: advanced ? 180 : 0 }}
											transition={{ duration: 0.15, ease: "easeInOut" }}
										>
											<ChevronDown className="h-3.5 w-3.5" />
										</motion.div>
									</button>
								</div>
								{field.state.meta.errors.length > 0 && (
									<p className="text-destructive text-[10px] mt-1 font-mono">
										{typeof field.state.meta.errors[0] === "string"
											? field.state.meta.errors[0]
											: field.state.meta.errors[0]?.message || "Invalid URL"}
									</p>
								)}
							</div>
						)}
					</form.Field>
				</div>

				<button
					type="submit"
					disabled={addBookmarkMutation.isPending}
					className="h-8 w-8 shrink-0 flex items-center justify-center rounded-sm border border-border bg-background text-muted-foreground hover:text-foreground hover:border-border/80 hover:bg-foreground/[0.04] transition-all duration-150 disabled:opacity-40"
				>
					<Plus className="w-3.5 h-3.5" />
				</button>
			</div>

			<AnimatePresence>
				{advanced && (
					<motion.div
						className="flex gap-2 overflow-hidden flex-col md:flex-row"
						initial={{ height: 0, opacity: 0, y: -8 }}
						animate={{ height: "auto", opacity: 1, y: 0 }}
						exit={{ height: 0, opacity: 0, y: -8 }}
						transition={{
							height: { duration: 0.18 },
							opacity: { duration: 0.18 },
							y: { duration: 0.18 },
						}}
					>
						<form.Field name="title">
							{(field) => (
								<Input
									type="text"
									placeholder="Title (optional)"
									className="w-full text-xs h-8 font-mono"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
							)}
						</form.Field>
						{isDesktop ? (
							<form.Field name="description">
								{(field) => (
									<Input
										type="text"
										placeholder="Description (optional)"
										className="w-full text-xs h-8 font-mono"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
								)}
							</form.Field>
						) : (
							<form.Field name="description">
								{(field) => (
									<Textarea
										placeholder="Description (optional)"
										className="w-full text-xs font-mono max-h-32"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
								)}
							</form.Field>
						)}
					</motion.div>
				)}
			</AnimatePresence>
		</form>
	);
}

export default AddBookmarkMenu;
