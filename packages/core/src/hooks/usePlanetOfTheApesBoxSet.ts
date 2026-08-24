import { useNamedBoxSet } from './useNamedBoxSet';

const PLANET_OF_THE_APES_COLLECTION_NAME = 'Planet of the Apes';

/**
 * Thin wrapper around {@link useNamedBoxSet} for the "Planet of the Apes"
 * collection.
 */
export function usePlanetOfTheApesBoxSet() {
    return useNamedBoxSet(PLANET_OF_THE_APES_COLLECTION_NAME);
}
