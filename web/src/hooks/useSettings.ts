import { useCallback, useState } from "react";

export type ViewMode = "grid" | "list";
export type GridColumns = 2 | 3 | 4;
export type SortBy = "newest" | "oldest" | "alphabetical";

export interface Settings {
	viewMode: ViewMode;
	gridColumns: GridColumns;
	sortBy: SortBy;
}

const DEFAULTS: Settings = {
	viewMode: "grid",
	gridColumns: 4,
	sortBy: "newest",
};

const STORAGE_KEY = "bookmarkr_settings";

function load(): Settings {
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) return { ...DEFAULTS, ...JSON.parse(stored) };
	} catch {}
	return DEFAULTS;
}

export function useSettings() {
	const [settings, setSettings] = useState<Settings>(load);

	const update = useCallback((patch: Partial<Settings>) => {
		setSettings((prev) => {
			const next = { ...prev, ...patch };
			localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
			return next;
		});
	}, []);

	return { settings, update };
}
