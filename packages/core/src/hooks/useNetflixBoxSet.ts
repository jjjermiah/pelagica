import { useNamedBoxSet } from './useNamedBoxSet';

const NETFLIX_COLLECTION_NAME = 'Netflix';

/**
 * Thin wrapper around {@link useNamedBoxSet} for the "Netflix" collection.
 */
export function useNetflixBoxSet() {
    return useNamedBoxSet(NETFLIX_COLLECTION_NAME);
}
