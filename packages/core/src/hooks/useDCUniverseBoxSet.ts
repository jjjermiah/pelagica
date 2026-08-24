import { useNamedBoxSet } from './useNamedBoxSet';

const DC_UNIVERSE_COLLECTION_NAME = 'DC Universe';

/**
 * Thin wrapper around {@link useNamedBoxSet} for the "DC Universe" collection.
 */
export function useDCUniverseBoxSet() {
    return useNamedBoxSet(DC_UNIVERSE_COLLECTION_NAME);
}
