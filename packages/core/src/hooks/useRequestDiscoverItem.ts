import { useMutation } from '@tanstack/react-query';
import type { DiscoverRequestPayload } from '../api/discover/types';
import { requestDiscoverItem } from '../api/discover/request';

/**
 * Mutation for requesting a Discover item. Callers are responsible for
 * optimistically reflecting the "requested" state locally (e.g. tracking
 * requested `tmdbId`s in component state) since the backend list endpoint
 * isn't re-fetched on every request.
 */
export function useRequestDiscoverItem() {
    return useMutation({
        mutationFn: (payload: DiscoverRequestPayload) => requestDiscoverItem(payload),
    });
}
