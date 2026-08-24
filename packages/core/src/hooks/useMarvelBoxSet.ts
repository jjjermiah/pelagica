import { useNamedBoxSet } from './useNamedBoxSet';

const MARVEL_COLLECTION_NAME = 'Marvel';

/**
 * Thin wrapper around {@link useNamedBoxSet} for the "Marvel" collection.
 * Kept as its own named hook for discoverability and to avoid touching
 * existing call sites.
 */
export function useMarvelBoxSet() {
    return useNamedBoxSet(MARVEL_COLLECTION_NAME);
}
