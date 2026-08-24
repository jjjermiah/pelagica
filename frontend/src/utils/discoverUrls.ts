const TMDB_POSTER_BASE = 'https://image.tmdb.org/t/p/w342';

/**
 * Builds a full TMDB CDN poster URL from the relative `posterPath` returned
 * by `/api/discover`. The TMDB image CDN is public and needs no auth,
 * regardless of whether Jellyseerr is configured on the backend.
 */
export function getDiscoverPosterUrl(posterPath: string): string {
    return `${TMDB_POSTER_BASE}${posterPath}`;
}
