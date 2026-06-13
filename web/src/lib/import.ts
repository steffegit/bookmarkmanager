export interface ParsedBookmark {
	url: string;
	title: string;
	description?: string;
}

const URL_RE = /^(https?:\/\/)([\w-]+\.)+[\w-]+(:\d+)?(\/\S*)?$/i;

function isValidHttpUrl(url: string): boolean {
	return URL_RE.test(url.trim());
}

function dedupe(bookmarks: ParsedBookmark[]): ParsedBookmark[] {
	const seen = new Set<string>();
	const out: ParsedBookmark[] = [];
	for (const b of bookmarks) {
		const key = b.url.trim();
		if (!isValidHttpUrl(key) || seen.has(key)) continue;
		seen.add(key);
		out.push({ ...b, url: key });
	}
	return out;
}

// Parses the Netscape Bookmark File Format exported by browsers (and by us).
function parseNetscapeHTML(content: string): ParsedBookmark[] {
	const doc = new DOMParser().parseFromString(content, "text/html");
	const anchors = Array.from(doc.querySelectorAll("a[href]"));

	return anchors.map((a) => {
		const url = a.getAttribute("href") ?? "";
		const title = a.textContent?.trim() || url;

		// Netscape format places an optional <DD> description after the <DT>.
		const dt = a.closest("dt");
		const sibling = dt?.nextElementSibling;
		const description =
			sibling?.tagName === "DD"
				? sibling.textContent?.trim() || undefined
				: undefined;

		return { url, title, description };
	});
}

type JsonBookmark = {
	url?: string;
	title?: string | null;
	description?: string | null;
};

// Parses our JSON export — both v1 (flat `bookmarks`) and v2 (`folders`).
function parseJSON(content: string): ParsedBookmark[] {
	const data = JSON.parse(content);
	const collected: JsonBookmark[] = [];

	if (Array.isArray(data?.bookmarks)) {
		collected.push(...data.bookmarks);
	}
	if (Array.isArray(data?.folders)) {
		for (const folder of data.folders) {
			if (Array.isArray(folder?.bookmarks)) collected.push(...folder.bookmarks);
		}
	}
	// Bare array of bookmarks.
	if (Array.isArray(data)) collected.push(...data);

	return collected
		.filter((b): b is JsonBookmark & { url: string } => typeof b.url === "string")
		.map((b) => ({
			url: b.url,
			title: b.title?.trim() || b.url,
			description: b.description?.trim() || undefined,
		}));
}

export function parseBookmarkFile(
	filename: string,
	content: string,
): ParsedBookmark[] {
	const lower = filename.toLowerCase();
	const looksJson = lower.endsWith(".json") || content.trim().startsWith("{");

	const parsed = looksJson
		? parseJSON(content)
		: parseNetscapeHTML(content);

	return dedupe(parsed);
}
