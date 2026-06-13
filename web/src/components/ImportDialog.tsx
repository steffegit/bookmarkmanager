import { useQueryClient } from "@tanstack/react-query";
import { FileUp, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { BACKEND_URL } from "@/hooks/useAuth";
import { type ParsedBookmark, parseBookmarkFile } from "@/lib/import";

interface ImportDialogProps {
	open: boolean;
	setOpen: (open: boolean) => void;
}

async function postBookmark(b: ParsedBookmark): Promise<"added" | "skipped"> {
	const token = localStorage.getItem("auth_token");
	const res = await fetch(`${BACKEND_URL}/api/bookmarks`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({
			url: b.url,
			title: b.title,
			description: b.description ?? null,
		}),
	});
	if (res.ok) return "added";
	// Duplicates (and other per-item issues) are skipped rather than fatal.
	return "skipped";
}

export function ImportDialog({ open, setOpen }: ImportDialogProps) {
	const queryClient = useQueryClient();
	const inputRef = useRef<HTMLInputElement>(null);
	const [parsed, setParsed] = useState<ParsedBookmark[] | null>(null);
	const [filename, setFilename] = useState("");
	const [importing, setImporting] = useState(false);
	const [progress, setProgress] = useState(0);

	function reset() {
		setParsed(null);
		setFilename("");
		setImporting(false);
		setProgress(0);
		if (inputRef.current) inputRef.current.value = "";
	}

	async function handleFile(file: File) {
		try {
			const content = await file.text();
			const bookmarks = parseBookmarkFile(file.name, content);
			if (bookmarks.length === 0) {
				toast.error("No valid bookmarks found in that file");
				return;
			}
			setFilename(file.name);
			setParsed(bookmarks);
		} catch {
			toast.error("Could not read that file");
		}
	}

	async function runImport() {
		if (!parsed) return;
		setImporting(true);
		setProgress(0);

		let added = 0;
		let skipped = 0;
		for (let i = 0; i < parsed.length; i++) {
			try {
				const result = await postBookmark(parsed[i]);
				if (result === "added") added++;
				else skipped++;
			} catch {
				skipped++;
			}
			setProgress(i + 1);
		}

		queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
		toast.success(
			`Imported ${added} bookmark${added === 1 ? "" : "s"}${
				skipped > 0 ? ` · ${skipped} skipped` : ""
			}`,
		);
		reset();
		setOpen(false);
	}

	return (
		<Dialog
			open={open}
			onOpenChange={(o) => {
				if (!importing) {
					setOpen(o);
					if (!o) reset();
				}
			}}
		>
			<DialogContent className="sm:max-w-[400px] border-border bg-popover p-0 gap-0">
				<DialogHeader className="px-4 pt-4 pb-3 border-b border-border">
					<DialogTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
						<Upload className="w-3.5 h-3.5 text-primary" />
						Import bookmarks
					</DialogTitle>
					<DialogDescription className="text-[11px] text-muted-foreground font-mono mt-0.5">
						Browser HTML or a Bookmarkr JSON export
					</DialogDescription>
				</DialogHeader>

				<div className="p-3 flex flex-col gap-3">
					<input
						ref={inputRef}
						type="file"
						accept=".html,.htm,.json"
						className="hidden"
						onChange={(e) => {
							const file = e.target.files?.[0];
							if (file) handleFile(file);
						}}
					/>

					{!parsed ? (
						<button
							type="button"
							onClick={() => inputRef.current?.click()}
							className="flex flex-col items-center justify-center gap-2 py-8 rounded-sm border border-dashed border-border bg-card hover:border-primary/40 hover:bg-card/60 transition-all duration-150"
						>
							<FileUp className="w-5 h-5 text-muted-foreground/60" />
							<p className="text-xs font-medium text-foreground">
								Choose a file
							</p>
							<p className="text-[11px] text-muted-foreground/60 font-mono">
								.html or .json
							</p>
						</button>
					) : (
						<div className="flex flex-col gap-3">
							<div className="rounded-sm border border-border bg-card p-3">
								<p className="text-xs font-medium text-foreground truncate">
									{filename}
								</p>
								<p className="text-[11px] text-muted-foreground font-mono mt-0.5">
									{parsed.length} bookmark{parsed.length === 1 ? "" : "s"} ready
									to import
								</p>
							</div>

							{importing && (
								<div className="flex flex-col gap-1.5">
									<div className="h-1 rounded-full bg-foreground/[0.08] overflow-hidden">
										<div
											className="h-full bg-primary transition-all duration-150"
											style={{
												width: `${(progress / parsed.length) * 100}%`,
											}}
										/>
									</div>
									<p className="text-[10px] text-muted-foreground/60 font-mono text-right">
										{progress} / {parsed.length}
									</p>
								</div>
							)}

							<div className="flex gap-2">
								<button
									type="button"
									disabled={importing}
									onClick={reset}
									className="flex-1 h-8 flex items-center justify-center text-xs font-medium text-muted-foreground border border-border rounded-sm hover:text-foreground hover:border-border/80 hover:bg-foreground/[0.04] transition-all disabled:opacity-40"
								>
									Choose another
								</button>
								<button
									type="button"
									disabled={importing}
									onClick={runImport}
									className="flex-1 h-8 flex items-center justify-center text-xs font-medium bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
								>
									{importing ? "Importing..." : `Import ${parsed.length}`}
								</button>
							</div>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
