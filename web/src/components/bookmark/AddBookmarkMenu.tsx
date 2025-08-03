import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { useMediaQuery } from "usehooks-ts";
import z from "zod";
import { Button } from "@/components/ui/button";
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
			// Invalidate and refetch bookmarks query
			queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
			toast.dismiss("add-bookmark");
			toast.success("Bookmark added successfully");
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

	// Focus on URL input
	useHotkeys(
		"ctrl+k, meta+k",
		() => {
			urlInputRef.current?.focus();
		},
		{ preventDefault: true },
	);

	// Submit form
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
			className="flex flex-col gap-2 max-w-7xl mx-auto px-4 md:p-0 mb-4"
		>
			<div className="flex gap-2">
				<div className="flex gap-2 relative w-full">
					<form.Field
						name="url"
						validators={{
							onChange: ({ value }) => {
								if (!value) return; // Don't show error for empty field
								const urlRegex =
									/^(https?:\/\/)?([\w-]+\.)+[\w-]+(:\d+)?(\/\S*)?$/i;
								if (!urlRegex.test(value)) {
									return "Please enter a valid URL";
								}
							},
						}}
					>
						{(field) => (
							<div className="w-full">
								<div className="relative">
									<Input
										type="text"
										placeholder="URL"
										className={`w-full text-sm ${field.state.meta.errors.length > 0 ? "border-red-500" : ""}`}
										required
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										ref={urlInputRef}
									/>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
										onClick={() => setAdvanced((prev) => !prev)}
									>
										<motion.div
											animate={{ rotate: advanced ? 180 : 0 }}
											transition={{ duration: 0.1, ease: "easeInOut" }}
										>
											<ChevronDown className="h-4 w-4" aria-hidden="true" />
										</motion.div>
										<span className="sr-only">
											{advanced ? "Hide advanced" : "Show advanced"}
										</span>
									</Button>
								</div>
								{field.state.meta.errors.length > 0 && (
									<p className="text-red-500 text-xs mt-1">
										{typeof field.state.meta.errors[0] === "string"
											? field.state.meta.errors[0]
											: field.state.meta.errors[0]?.message || "Invalid URL"}
									</p>
								)}
							</div>
						)}
					</form.Field>
				</div>
				<Button
					variant="outline"
					size="icon"
					type="submit"
					disabled={addBookmarkMutation.isPending}
				>
					<Plus className="w-4 h-4" />
				</Button>
			</div>
			<AnimatePresence>
				{advanced && (
					<motion.div
						className="flex gap-2 overflow-hidden flex-col md:flex-row"
						initial={{ height: 0, opacity: 0, y: -20 }}
						animate={{ height: "auto", opacity: 1, y: 0 }}
						exit={{ height: 0, opacity: 0, y: -20 }}
						transition={{
							height: { duration: 0.2 },
							opacity: { duration: 0.2 },
							y: { duration: 0.2 },
						}}
					>
						<form.Field name="title">
							{(field) => (
								<Input
									type="text"
									placeholder="Title"
									className="w-full text-sm"
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
										placeholder="Description"
										className="w-full text-sm"
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
										placeholder="Description"
										className="w-full text-sm max-h-48"
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
