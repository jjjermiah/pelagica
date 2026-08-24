import { useNamedBoxSet } from './useNamedBoxSet';

const APPLE_TV_COLLECTION_NAME = 'Apple TV+';

/**
 * Thin wrapper around {@link useNamedBoxSet} for the "Apple TV+" collection.
 */
export function useAppleTVBoxSet() {
    return useNamedBoxSet(APPLE_TV_COLLECTION_NAME);
}
