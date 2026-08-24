import { useNamedBoxSet } from './useNamedBoxSet';

const PIRATES_OF_THE_CARIBBEAN_COLLECTION_NAME = 'Pirates of the Caribbean';

/**
 * Thin wrapper around {@link useNamedBoxSet} for the
 * "Pirates of the Caribbean" collection.
 */
export function usePiratesOfTheCaribbeanBoxSet() {
    return useNamedBoxSet(PIRATES_OF_THE_CARIBBEAN_COLLECTION_NAME);
}
