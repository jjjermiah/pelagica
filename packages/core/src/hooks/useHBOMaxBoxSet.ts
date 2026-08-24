import { useNamedBoxSet } from './useNamedBoxSet';

const HBO_MAX_COLLECTION_NAME = 'HBO Max';

/**
 * Thin wrapper around {@link useNamedBoxSet} for the "HBO Max" collection.
 */
export function useHBOMaxBoxSet() {
    return useNamedBoxSet(HBO_MAX_COLLECTION_NAME);
}
