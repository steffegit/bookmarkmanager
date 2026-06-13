import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (error) {
    return "";
  }
}

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://0.0.0.0:8080";

/**
 * Routes a remote image through our backend proxy, which fetches it once,
 * caches the bytes in Redis, and serves them back with long-lived cache
 * headers — so previews and icons load fast and don't depend on slow or
 * flaky third-party hosts on every page load.
 */
export function getProxiedImageUrl(url: string): string {
  return `${BACKEND_URL}/api/image?url=${encodeURIComponent(url)}`;
}

/**
 * Returns a favicon URL via Google's S2 favicon service, which reliably
 * resolves an icon for a domain (falling back to the site's own discovery)
 * instead of guessing at /favicon.ico, which many sites don't serve. The
 * result is routed through our caching image proxy.
 */
export function getFaviconUrl(domain: string, size: 16 | 32 | 64 = 32): string {
  return getProxiedImageUrl(
    `https://www.google.com/s2/favicons?domain=${encodeURIComponent(
      domain,
    )}&sz=${size}`,
  );
}
