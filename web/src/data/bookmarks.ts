import { BACKEND_URL } from "@/hooks/useAuth";

export type Bookmark = {
  id: string;
  url: string;
  title: string;
  description?: string;
  ogImageUrl: string;
};

export interface bookmarkPostRequest {
  url: string;
  title: string;
  description?: string;
}

export const fetchBookmarks = async () => {
  const token = localStorage.getItem("auth_token");

  if (!token) {
    throw new Error("Authentication required");
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/bookmarks`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Authentication required");
      }
      throw new Error("Failed to fetch bookmarks");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    throw error; // Re-throw the error so React Query can handle it
  }
};
