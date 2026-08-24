import { useQuery } from '@tanstack/react-query';
import { fetchDiscover } from '../api/discover/fetch';
import type { DiscoverItem } from '../api/discover/types';

export interface UseDiscoverTrendingOptions {
    /** TMDB watch provider id, e.g. 8 for Netflix. */
    provider: number;
    /** ISO 3166-1 region code, e.g. "US". */
    region: string;
}

export interface DiscoverTrendingResult {
    movies: DiscoverItem[];
    shows: DiscoverItem[];
    isLoading: boolean;
    /**
     * True once both queries have settled and either endpoint indicated the
     * feature isn't available on this deployment (backend 503, i.e.
     * Jellyseerr not configured) or failed outright. Callers should render
     * nothing in this case rather than showing an error.
     */
    notConfigured: boolean;
}

/**
 * Fetches trending movies and shows for a TMDB watch provider from the
 * backend `/api/discover` endpoint (two requests, one per media type).
 */
export function useDiscoverTrending({
    provider,
    region,
}: UseDiscoverTrendingOptions): DiscoverTrendingResult {
    const moviesQuery = useQuery({
        queryKey: ['discover', provider, 'movie', region],
        queryFn: () => fetchDiscover(provider, 'movie', region),
        staleTime: 15 * 60 * 1000,
        retry: false,
    });

    const showsQuery = useQuery({
        queryKey: ['discover', provider, 'tv', region],
        queryFn: () => fetchDiscover(provider, 'tv', region),
        staleTime: 15 * 60 * 1000,
        retry: false,
    });

    const isLoading = moviesQuery.isLoading || showsQuery.isLoading;
    const settled = moviesQuery.isFetched && showsQuery.isFetched;
    const notConfigured =
        settled &&
        (moviesQuery.data === null ||
            showsQuery.data === null ||
            !!moviesQuery.error ||
            !!showsQuery.error);

    return {
        movies: moviesQuery.data ?? [],
        shows: showsQuery.data ?? [],
        isLoading,
        notConfigured,
    };
}
