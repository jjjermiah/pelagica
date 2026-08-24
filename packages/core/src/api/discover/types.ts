export type DiscoverMediaType = 'movie' | 'tv';

export type DiscoverItemStatus = 'available' | 'partial' | 'pending' | 'processing' | 'none';

export interface DiscoverItem {
    tmdbId: number;
    mediaType: DiscoverMediaType;
    title: string;
    year: string | null;
    posterPath: string | null;
    status: DiscoverItemStatus;
    /**
     * TMDB's own 0-10 vote average, when available. `null` when the title
     * has no votes yet (backend omits the field entirely; the client fills
     * in `null` via the parsed JSON's missing key).
     */
    tmdbRating: number | null;
}

export interface DiscoverRequestPayload {
    tmdbId: number;
    mediaType: DiscoverMediaType;
}
