import { useQuery } from "@tanstack/react-query";
import { Download, FileCode2, FileJson2 } from "lucide-react";
import { toast } from "sonner";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { type Bookmark, fetchBookmarks } from "@/data/bookmarks";
import { useAuth } from "@/hooks/useAuth";
import { useFolders } from "@/hooks/useFolders";
import {
	buildFolderGroups,
	exportAsJSON,
	exportAsNetscapeHTML,
} from "@/lib/export";

interface ExportDialogProps {
	open: boolean;
	setOpen: (open: boolean) => void;
}

export function ExportDialog({ open, setOpen }: ExportDialogProps) {
	const { isAuthenticated } = useAuth();

	const { data: bookmarks } = useQuery({
		queryKey: ["bookmarks"],
		queryFn: fetchBookmarks,
		enabled: isAuthenticated,
	});

	const { folders, assignments } = useFolders();

	function handleExport(format: "json" | "html") {
		const list: Bookmark[] = bookmarks ?? [];
		if (list.length === 0) {
			toast.error("No bookmarks to export");
			return;
		}
		const groups = buildFolderGroups(list, folders, assignments);
		if (format === "json") {
			exportAsJSON(groups);
		} else {
			exportAsNetscapeHTML(groups);
		}
		toast.success(
			`Exported ${list.length} bookmark${list.length === 1 ? "" : "s"} in ${groups.length} folder${groups.length === 1 ? "" : "s"}`,
		);
		setOpen(false);
	}

	const count = bookmarks?.length ?? 0;

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent className="sm:max-w-[400px] border-border bg-popover p-0 gap-0">
				<DialogHeader className="px-4 pt-4 pb-3 border-b border-border">
					<DialogTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
						<Download className="w-3.5 h-3.5 text-primary" />
						Export bookmarks
					</DialogTitle>
					<DialogDescription className="text-[11px] text-muted-foreground font-mono mt-0.5">
						{count} bookmark{count === 1 ? "" : "s"} · choose a format
					</DialogDescription>
				</DialogHeader>

				<div className="p-3 flex flex-col gap-2">
					<button
						type="button"
						onClick={() => handleExport("html")}
						className="group flex items-start gap-3 p-3 rounded-sm border border-border bg-card hover:border-primary/40 hover:bg-card/60 transition-all duration-150 text-left"
					>
						<div className="w-7 h-7 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
							<FileCode2 className="w-3.5 h-3.5 text-primary" />
						</div>
						<div className="min-w-0">
							<p className="text-xs font-medium text-foreground">
								Browser bookmarks{" "}
								<span className="text-[10px] text-muted-foreground font-mono">
									.html
								</span>
							</p>
							<p className="text-[11px] text-muted-foreground font-mono mt-0.5 leading-relaxed">
								Netscape format. Import directly into Firefox, Chrome, Opera,
								Edge, or Safari.
							</p>
							<div className="flex items-center gap-1 mt-1.5 flex-wrap">
								{["Firefox", "Chrome", "Opera", "Edge"].map((b) => (
									<span
										key={b}
										className="inline-flex items-center px-1.5 py-0.5 rounded-[3px] bg-foreground/[0.06] border border-border text-[9px] text-muted-foreground font-mono"
									>
										{b}
									</span>
								))}
							</div>
						</div>
					</button>

					<button
						type="button"
						onClick={() => handleExport("json")}
						className="group flex items-start gap-3 p-3 rounded-sm border border-border bg-card hover:border-primary/40 hover:bg-card/60 transition-all duration-150 text-left"
					>
						<div className="w-7 h-7 rounded-sm bg-foreground/[0.04] border border-border flex items-center justify-center shrink-0 mt-0.5">
							<FileJson2 className="w-3.5 h-3.5 text-muted-foreground" />
						</div>
						<div className="min-w-0">
							<p className="text-xs font-medium text-foreground">
								JSON data{" "}
								<span className="text-[10px] text-muted-foreground font-mono">
									.json
								</span>
							</p>
							<p className="text-[11px] text-muted-foreground font-mono mt-0.5 leading-relaxed">
								Structured data with all fields. Great for backups or custom
								integrations.
							</p>
						</div>
					</button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
