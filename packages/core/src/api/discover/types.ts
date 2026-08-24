export type DiscoverMediaType = 'movie' | 'tv';

export type DiscoverItemStatus = 'available' | 'partial' | 'pending' | 'processing' | 'none';

export interface DiscoverItem {
    tmdbId: number;
    mediaType: DiscoverMediaType;
    title: string;
    year: string | null;
    posterPath: string | null;
    status: DiscoverItemStatus;
}

export interface DiscoverRequestPayload {
    tmdbId: number;
    mediaType: DiscoverMediaType;
}
