import { useNamedBoxSet } from './useNamedBoxSet';

const TRANSFORMERS_COLLECTION_NAME = 'Transformers';

/**
 * Thin wrapper around {@link useNamedBoxSet} for the "Transformers" collection.
 */
export function useTransformersBoxSet() {
    return useNamedBoxSet(TRANSFORMERS_COLLECTION_NAME);
}
