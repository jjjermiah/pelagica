import type { DiscoverItem, DiscoverMediaType } from './types';

/**
 * Fetches trending titles for a given TMDB watch provider from the backend
 * `/api/discover` endpoint.
 *
 * Returns `null` when the backend responds `503` (Jellyseerr not configured
 * on this deployment) — callers should treat that as "feature unavailable"
 * and hide the UI, not as an error.
 */
export async function fetchDiscover(
    provider: number,
    type: DiscoverMediaType,
    region: string
): Promise<DiscoverItem[] | null> {
    const params = new URLSearchParams({
        provider: String(provider),
        type,
        region,
    });

    const response = await fetch(`/api/discover?${params.toString()}`);

    if (response.status === 503) {
        return null;
    }

    if (!response.ok) {
        throw new Error(`Failed to fetch discover results (${response.status})`);
    }

    const items = (await response.json()) as DiscoverItem[];
    // The backend omits `tmdbRating` entirely (via `omitempty`) rather than
    // sending `null` when a title has no votes yet — normalize the missing
    // key here so the rest of the app can rely on `number | null`.
    return items.map((item) => ({ ...item, tmdbRating: item.tmdbRating ?? null }));
}
