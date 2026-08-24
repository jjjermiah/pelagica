import { useNamedBoxSet } from './useNamedBoxSet';

const ANIME_COLLECTION_NAME = 'Anime';

/**
 * Thin wrapper around {@link useNamedBoxSet} for the "Anime" collection.
 */
export function useAnimeBoxSet() {
    return useNamedBoxSet(ANIME_COLLECTION_NAME);
}
