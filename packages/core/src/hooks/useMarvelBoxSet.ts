import { getApi } from '../api/getApi';
import { useQuery } from '@tanstack/react-query';
import { getItemsApi } from '@jellyfin/sdk/lib/utils/api/items-api';
import { getRetryConfig } from '../utils/authErrorHandler';

const MARVEL_COLLECTION_NAME = 'Marvel';

/**
 * Looks up the Jellyfin BoxSet/Collection named "Marvel" by name at runtime
 * (never hardcode a collection ID — collection IDs are server-specific and
 * are not known at build time).
 *
 * Returns the matching BoxSet's `Id`, or `null` if no "Marvel" collection
 * exists on the connected server. Callers should treat `null` as an expected,
 * non-error state (hide the nav entry / show an empty state) rather than a
 * failure.
 */
export function useMarvelBoxSet() {
    return useQuery<string | null>({
        queryKey: ['marvelBoxSet'],
        queryFn: async (): Promise<string | null> => {
            const api = getApi();
            const itemsApi = getItemsApi(api);
            const response = await itemsApi.getItems({
                includeItemTypes: ['BoxSet'],
                searchTerm: MARVEL_COLLECTION_NAME,
                recursive: true,
            });
            const items = response.data.Items ?? [];
            const exactMatch = items.find(
                (item) => item.Name?.toLowerCase() === MARVEL_COLLECTION_NAME.toLowerCase()
            );
            return (exactMatch ?? items[0])?.Id ?? null;
        },
        ...getRetryConfig(),
    });
}
