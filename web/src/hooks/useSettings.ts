import { useCallback, useSyncExternalStore } from "react";

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

function read(): Settings {
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) return { ...DEFAULTS, ...JSON.parse(stored) };
	} catch {}
	return DEFAULTS;
}

// A tiny shared store so every component using useSettings stays in sync —
// changing a setting on the settings page immediately reflects on the
// bookmarks page (and across tabs via the `storage` event).
let current: Settings = read();
const listeners = new Set<() => void>();

function emit() {
	for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
}

function getSnapshot(): Settings {
	return current;
}

if (typeof window !== "undefined") {
	window.addEventListener("storage", (e) => {
		if (e.key === STORAGE_KEY) {
			current = read();
			emit();
		}
	});
}

export function useSettings() {
	const settings = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

	const update = useCallback((patch: Partial<Settings>) => {
		current = { ...current, ...patch };
		localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
		emit();
	}, []);

	return { settings, update };
}
