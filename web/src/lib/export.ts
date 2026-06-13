import type { Bookmark } from "@/data/bookmarks";

export interface ExportGroup {
	/** Folder name, or null for bookmarks that sit at the top level. */
	name: string | null;
	bookmarks: Bookmark[];
}

function downloadFile(content: string, filename: string, mimeType: string) {
	const blob = new Blob([content], { type: mimeType });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}

function escapeHtml(str: string): string {
	return str
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}

function slugify(label: string): string {
	return (
		label
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-+|-+$/g, "") || "bookmarks"
	);
}

function addDate(b: Bookmark): number {
	return b.createdAt
		? Math.floor(new Date(b.createdAt).getTime() / 1000)
		: Math.floor(Date.now() / 1000);
}

/**
 * Builds export groups from the flat bookmark list and the folder assignments.
 * Each non-empty folder becomes a group; anything left over is collected into
 * a trailing "Unassigned" group.
 */
export function buildFolderGroups(
	bookmarks: Bookmark[],
	folders: { id: string; name: string }[],
	assignments: Record<string, string>,
): ExportGroup[] {
	const groups: ExportGroup[] = [];

	for (const folder of folders) {
		const inFolder = bookmarks.filter((b) => assignments[b.id] === folder.id);
		if (inFolder.length > 0) {
			groups.push({ name: folder.name, bookmarks: inFolder });
		}
	}

	const unassigned = bookmarks.filter((b) => !assignments[b.id]);
	if (unassigned.length > 0) {
		groups.push({ name: "Unassigned", bookmarks: unassigned });
	}

	return groups;
}

export function exportAsJSON(groups: ExportGroup[], label = "bookmarks") {
	const data = {
		version: 2,
		exportedAt: new Date().toISOString(),
		folders: groups.map((g) => ({
			name: g.name,
			bookmarks: g.bookmarks.map((b) => ({
				url: b.url,
				title: b.title,
				description: b.description ?? null,
				createdAt: b.createdAt ?? null,
			})),
		})),
	};
	downloadFile(
		JSON.stringify(data, null, 2),
		`${slugify(label)}-${new Date().toISOString().slice(0, 10)}.json`,
		"application/json",
	);
}

function renderBookmark(b: Bookmark, indent: string): string {
	const title = escapeHtml(b.title || b.url);
	const href = escapeHtml(b.url);
	const desc = b.description ? `\n${indent}<DD>${escapeHtml(b.description)}` : "";
	return `${indent}<DT><A HREF="${href}" ADD_DATE="${addDate(b)}">${title}</A>${desc}`;
}

// Netscape Bookmark File Format — the universal standard, with nested folders
// expressed as <DT><H3>…</H3> headings. Supported by Firefox, Chrome, Opera,
// Edge, and Safari for import.
export function exportAsNetscapeHTML(groups: ExportGroup[], label = "bookmarks") {
	const body = groups
		.map((group) => {
			if (group.name === null) {
				return group.bookmarks.map((b) => renderBookmark(b, "    ")).join("\n");
			}
			const now = Math.floor(Date.now() / 1000);
			const inner = group.bookmarks
				.map((b) => renderBookmark(b, "        "))
				.join("\n");
			return `    <DT><H3 ADD_DATE="${now}">${escapeHtml(group.name)}</H3>
    <DL><p>
${inner}
    </DL><p>`;
		})
		.join("\n");

	const html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and overwritten.
     DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
${body}
</DL><p>`;

	downloadFile(
		html,
		`${slugify(label)}-${new Date().toISOString().slice(0, 10)}.html`,
		"text/html",
	);
}
