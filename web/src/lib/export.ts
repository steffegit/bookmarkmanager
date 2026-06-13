import type { Bookmark } from "@/data/bookmarks";

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

export function exportAsJSON(bookmarks: Bookmark[]) {
	const data = {
		version: 1,
		exportedAt: new Date().toISOString(),
		bookmarks: bookmarks.map((b) => ({
			url: b.url,
			title: b.title,
			description: b.description ?? null,
			createdAt: b.createdAt ?? null,
		})),
	};
	downloadFile(
		JSON.stringify(data, null, 2),
		`bookmarks-${new Date().toISOString().slice(0, 10)}.json`,
		"application/json",
	);
}

// Netscape Bookmark File Format — the universal standard.
// Supported by Firefox, Chrome, Opera, Edge, Safari for import.
export function exportAsNetscapeHTML(bookmarks: Bookmark[]) {
	const items = bookmarks
		.map((b) => {
			const addDate = b.createdAt
				? Math.floor(new Date(b.createdAt).getTime() / 1000)
				: Math.floor(Date.now() / 1000);
			const title = escapeHtml(b.title || b.url);
			const href = escapeHtml(b.url);
			const desc = b.description
				? `\n    <DD>${escapeHtml(b.description)}`
				: "";
			return `    <DT><A HREF="${href}" ADD_DATE="${addDate}">${title}</A>${desc}`;
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
${items}
</DL><p>`;

	downloadFile(
		html,
		`bookmarks-${new Date().toISOString().slice(0, 10)}.html`,
		"text/html",
	);
}
