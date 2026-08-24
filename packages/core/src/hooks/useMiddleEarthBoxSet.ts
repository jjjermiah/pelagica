import { useNamedBoxSet } from './useNamedBoxSet';

const MIDDLE_EARTH_COLLECTION_NAME = 'Middle-earth';

/**
 * Thin wrapper around {@link useNamedBoxSet} for the "Middle-earth"
 * collection (LOTR / Hobbit / Rings of Power).
 */
export function useMiddleEarthBoxSet() {
    return useNamedBoxSet(MIDDLE_EARTH_COLLECTION_NAME);
}
