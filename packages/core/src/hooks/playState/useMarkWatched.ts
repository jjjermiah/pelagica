import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getPlaystateApi } from '@jellyfin/sdk/lib/utils/api/playstate-api';
import { getTvShowsApi } from '@jellyfin/sdk/lib/utils/api/tv-shows-api';
import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client/models';
import { getApi } from '../../api/getApi';

interface MarkWatchedInput {
    item: BaseItemDto;
    userId?: string;
}

/**
 * Resolve the Jellyfin item id that "watched" applies to for a Continue
 * Watching card. Movies and episodes are themselves; a Series card represents
 * its next-up episode, so resolve that via the NextUp API.
 */
async function resolveWatchedItemId(
    item: BaseItemDto,
    userId: string
): Promise<string> {
    if (item.Type !== 'Series') {
        if (!item.Id) throw new Error('Item has no id');
        return item.Id;
    }

    const api = getApi();
    const tvShowsApi = getTvShowsApi(api);
    const response = await tvShowsApi.getNextUp({
        userId,
        seriesId: item.Id!,
        limit: 1,
        enableUserData: true,
    });

    const nextUpEpisode = response.data.Items?.[0];
    if (!nextUpEpisode?.Id) {
        throw new Error('No next-up episode found for series');
    }
    return nextUpEpisode.Id;
}

/**
 * Mark an item fully watched (Jellyfin `MarkPlayedItem`), which clears it from
 * Continue Watching server-side. Series cards are resolved to their next-up
 * episode first (see {@link resolveWatchedItemId}).
 *
 * Invalidates the continue-watching / resume / next-up caches so the card
 * disappears without a reload.
 */
export function useMarkWatched() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ item, userId }: MarkWatchedInput) => {
            if (!userId) throw new Error('User ID is required');

            const itemId = await resolveWatchedItemId(item, userId);
            const api = getApi();
            const playstateApi = getPlaystateApi(api);

            await playstateApi.markPlayedItem({
                userId,
                itemId,
                datePlayed: new Date().toISOString(),
            });
            return itemId;
        },
        onSuccess: (itemId, { userId }) => {
            queryClient.invalidateQueries({
                queryKey: ['continueWatchingAndNextUp'],
            });
            queryClient.invalidateQueries({ queryKey: ['nextUp'] });
            queryClient.invalidateQueries({ queryKey: ['resume'] });
            queryClient.invalidateQueries({ queryKey: ['seriesNextUp'] });
            queryClient.invalidateQueries({
                queryKey: ['userLibraryItem', itemId, userId],
            });
            queryClient.invalidateQueries({ queryKey: ['item', itemId] });
            queryClient.invalidateQueries({ queryKey: ['episodes', itemId] });
        },
    });
}
