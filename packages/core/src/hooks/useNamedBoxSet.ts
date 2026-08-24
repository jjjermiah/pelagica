import { getApi } from '../api/getApi';
import { useQuery } from '@tanstack/react-query';
import { getItemsApi } from '@jellyfin/sdk/lib/utils/api/items-api';
import { getRetryConfig } from '../utils/authErrorHandler';

/**
 * Looks up a Jellyfin BoxSet/Collection by exact name at runtime (never
 * hardcode a collection ID — collection IDs are server-specific and are not
 * known at build time).
 *
 * Returns the matching BoxSet's `Id`, or `null` if no collection with that
 * name exists on the connected server. Callers should treat `null` as an
 * expected, non-error state (hide the nav entry / show an empty state)
 * rather than a failure.
 *
 * @param name Exact BoxSet/Collection name to search for (case-insensitive
 * exact match preferred; falls back to the first search result).
 */
export function useNamedBoxSet(name: string) {
    return useQuery<string | null>({
        queryKey: ['namedBoxSet', name],
        queryFn: async (): Promise<string | null> => {
            const api = getApi();
            const itemsApi = getItemsApi(api);
            const response = await itemsApi.getItems({
                includeItemTypes: ['BoxSet'],
                searchTerm: name,
                recursive: true,
            });
            const items = response.data.Items ?? [];
            const exactMatch = items.find(
                (item) => item.Name?.toLowerCase() === name.toLowerCase()
            );
            return (exactMatch ?? items[0])?.Id ?? null;
        },
        enabled: name.length > 0,
        ...getRetryConfig(),
    });
}
