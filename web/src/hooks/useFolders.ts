import { useCallback, useState } from "react";

export interface Folder {
	id: string;
	name: string;
	createdAt: string;
}

// bookmarkId → folderId
type Assignments = Record<string, string>;

const FOLDERS_KEY = "bookmarkr_folders";
const ASSIGNMENTS_KEY = "bookmarkr_folder_assignments";

function load<T>(key: string, fallback: T): T {
	try {
		const raw = localStorage.getItem(key);
		return raw ? (JSON.parse(raw) as T) : fallback;
	} catch {
		return fallback;
	}
}

function save(key: string, value: unknown) {
	localStorage.setItem(key, JSON.stringify(value));
}

export function useFolders() {
	const [folders, setFolders] = useState<Folder[]>(() =>
		load<Folder[]>(FOLDERS_KEY, []),
	);
	const [assignments, setAssignments] = useState<Assignments>(() =>
		load<Assignments>(ASSIGNMENTS_KEY, {}),
	);

	const createFolder = useCallback((name: string): Folder => {
		const folder: Folder = {
			id: crypto.randomUUID(),
			name: name.trim(),
			createdAt: new Date().toISOString(),
		};
		setFolders((prev) => {
			const next = [...prev, folder];
			save(FOLDERS_KEY, next);
			return next;
		});
		return folder;
	}, []);

	const renameFolder = useCallback((id: string, name: string) => {
		setFolders((prev) => {
			const next = prev.map((f) =>
				f.id === id ? { ...f, name: name.trim() } : f,
			);
			save(FOLDERS_KEY, next);
			return next;
		});
	}, []);

	const deleteFolder = useCallback((id: string) => {
		setFolders((prev) => {
			const next = prev.filter((f) => f.id !== id);
			save(FOLDERS_KEY, next);
			return next;
		});
		setAssignments((prev) => {
			const next = { ...prev };
			for (const key of Object.keys(next)) {
				if (next[key] === id) delete next[key];
			}
			save(ASSIGNMENTS_KEY, next);
			return next;
		});
	}, []);

	const assignBookmark = useCallback(
		(bookmarkId: string, folderId: string | null) => {
			setAssignments((prev) => {
				const next = { ...prev };
				if (folderId === null) {
					delete next[bookmarkId];
				} else {
					next[bookmarkId] = folderId;
				}
				save(ASSIGNMENTS_KEY, next);
				return next;
			});
		},
		[],
	);

	const applyAISuggestions = useCallback(
		(
			suggestions: Array<{ name: string; bookmarkIds: string[] }>,
			existingFolders: Folder[],
		) => {
			const newFolders: Folder[] = [];
			const newAssignments: Assignments = {};

			for (const s of suggestions) {
				const existing = existingFolders.find(
					(f) => f.name.toLowerCase() === s.name.toLowerCase(),
				);
				const folder: Folder = existing ?? {
					id: crypto.randomUUID(),
					name: s.name,
					createdAt: new Date().toISOString(),
				};
				if (!existing) newFolders.push(folder);

				for (const bookmarkId of s.bookmarkIds) {
					newAssignments[bookmarkId] = folder.id;
				}
			}

			setFolders((prev) => {
				const next = [...prev, ...newFolders];
				save(FOLDERS_KEY, next);
				return next;
			});
			setAssignments((prev) => {
				const next = { ...prev, ...newAssignments };
				save(ASSIGNMENTS_KEY, next);
				return next;
			});
		},
		[],
	);

	const getFolderCount = useCallback(
		(folderId: string, allBookmarkIds: string[]) =>
			allBookmarkIds.filter((id) => assignments[id] === folderId).length,
		[assignments],
	);

	const getUnassignedCount = useCallback(
		(allBookmarkIds: string[]) =>
			allBookmarkIds.filter((id) => !assignments[id]).length,
		[assignments],
	);

	return {
		folders,
		assignments,
		createFolder,
		renameFolder,
		deleteFolder,
		assignBookmark,
		applyAISuggestions,
		getFolderCount,
		getUnassignedCount,
	};
}
