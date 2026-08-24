import { useNamedBoxSet } from './useNamedBoxSet';

const HARRY_POTTER_COLLECTION_NAME = 'Harry Potter';

/**
 * Thin wrapper around {@link useNamedBoxSet} for the "Harry Potter" collection.
 */
export function useHarryPotterBoxSet() {
    return useNamedBoxSet(HARRY_POTTER_COLLECTION_NAME);
}
