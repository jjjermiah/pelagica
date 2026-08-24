import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Clapperboard, Tv } from 'lucide-react';
import type { BaseItemKind } from '@jellyfin/sdk/lib/generated-client/models';
import { useSectionItems } from '@pelagica/core';
import Page from '../Page';
import ItemsGridPage from '@/components/ItemsGridPage';
import { useItemsGridState } from '@/hooks/useItemsGridState';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';

const GRID_COLS =
    'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 2xl:grid-cols-9';

const MOVIE_TYPES: BaseItemKind[] = ['Movie'];
const SERIES_TYPES: BaseItemKind[] = ['Series'];

/**
 * Below this item count (for either Movies or Shows), the tabbed UI is
 * replaced by both sections stacked vertically on one page, since a
 * near-empty tab is worse UX than a single scroll.
 */
const STACK_THRESHOLD = 20;

type CollectionTab = 'movies' | 'shows';

const CollectionTabPageSkeleton = () => (
    <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <Skeleton className="h-8 w-48 rounded-md" />
            <Skeleton className="h-9 w-40 rounded-lg" />
        </div>
        <div className={`w-full gap-4 grid ${GRID_COLS}`}>
            {Array.from({ length: 14 }).map((_, i) => (
                <div key={i}>
                    <Skeleton className="w-full aspect-2/3 rounded-md" />
                    <Skeleton className="mt-2 h-4 w-3/4" />
                    <Skeleton className="mt-1 h-3 w-1/4" />
                </div>
            ))}
        </div>
    </div>
);

export interface CollectionTabPageProps {
    /**
     * i18n namespace holding this collection's `title`, `movies`, `shows`,
     * `no_collection_title`, and `no_collection_description` keys.
     */
    i18nNamespace: string;
    /** Resolved BoxSet id, or `null`/`undefined` while still unresolved. */
    boxSetId: string | null | undefined;
    /** Whether the BoxSet lookup is still in flight. */
    isLoadingBoxSet: boolean;
    /** Icon shown in the empty state when no matching collection exists. */
    emptyIcon: ReactNode;
    /** Which tab is active on first render. Defaults to 'movies'. */
    defaultTab?: CollectionTab;
}

/**
 * Generic Movies/Shows view for a Jellyfin BoxSet/Collection, resolved by
 * name via `useNamedBoxSet` (see callers). Shows a skeleton while the
 * BoxSet is being resolved, and an empty state if none is found.
 *
 * Once resolved, both the Movies and Shows counts are fetched. If either
 * count is below `STACK_THRESHOLD`, both sections render stacked
 * vertically on one page (skipping any section with zero items) instead
 * of forcing the user to click between two near-empty tabs. Otherwise the
 * existing tabbed UI is used.
 */
const CollectionTabPage = ({
    i18nNamespace,
    boxSetId,
    isLoadingBoxSet,
    emptyIcon,
    defaultTab = 'movies',
}: CollectionTabPageProps) => {
    const { t } = useTranslation(i18nNamespace);
    const [activeTab, setActiveTab] = useState<CollectionTab>(defaultTab);

    // Independent pagination/sort state per section. Both tabbed and
    // stacked layouts use these directly, so paging one section (in
    // stacked mode, where both render simultaneously) never affects the
    // other.
    const moviesState = useItemsGridState({ sortBy: 'CommunityRating', sortOrder: 'Descending' });
    const showsState = useItemsGridState({ sortBy: 'CommunityRating', sortOrder: 'Descending' });

    // Both sections are always fetched (not gated by `activeTab`) so the
    // stacked-vs-tabbed decision can be made as soon as boxSetId resolves.
    const moviesResult = useSectionItems(
        boxSetId ? { libraryId: boxSetId, types: MOVIE_TYPES } : undefined,
        moviesState.params
    );
    const showsResult = useSectionItems(
        boxSetId ? { libraryId: boxSetId, types: SERIES_TYPES } : undefined,
        showsState.params
    );

    const countsResolved = !moviesResult.isLoading && !showsResult.isLoading;
    const moviesCount = moviesResult.data?.totalCount ?? 0;
    const showsCount = showsResult.data?.totalCount ?? 0;
    const isStacked = moviesCount < STACK_THRESHOLD || showsCount < STACK_THRESHOLD;

    // Still show a section if it errored, even when its (fallback) count
    // is 0, so the error message in ItemsGridPage isn't silently hidden.
    const showMoviesSection = !!moviesResult.error || moviesCount > 0;
    const showShowsSection = !!showsResult.error || showsCount > 0;

    const handleTabChange = (value: string) => {
        setActiveTab(value === 'shows' ? 'shows' : 'movies');
    };

    return (
        <Page title={t('title')} requiresAuth pagePadding>
            {isLoadingBoxSet && <CollectionTabPageSkeleton />}

            {!isLoadingBoxSet && !boxSetId && (
                <Empty>
                    <EmptyHeader>
                        <EmptyMedia variant="icon">{emptyIcon}</EmptyMedia>
                        <EmptyTitle>{t('no_collection_title')}</EmptyTitle>
                        <EmptyDescription>{t('no_collection_description')}</EmptyDescription>
                    </EmptyHeader>
                </Empty>
            )}

            {!isLoadingBoxSet && boxSetId && !countsResolved && <CollectionTabPageSkeleton />}

            {!isLoadingBoxSet && boxSetId && countsResolved && isStacked && (
                <div className="flex flex-col gap-10">
                    {showMoviesSection && (
                        <ItemsGridPage title={t('movies')} state={moviesState} result={moviesResult} />
                    )}
                    {showShowsSection && (
                        <ItemsGridPage title={t('shows')} state={showsState} result={showsResult} />
                    )}
                </div>
            )}

            {!isLoadingBoxSet && boxSetId && countsResolved && !isStacked && (
                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                    <div className="flex justify-center">
                        <TabsList>
                            <TabsTrigger value="movies">
                                <Clapperboard />
                                {t('movies')}
                            </TabsTrigger>
                            <TabsTrigger value="shows">
                                <Tv />
                                {t('shows')}
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="movies">
                        <ItemsGridPage title={t('movies')} state={moviesState} result={moviesResult} />
                    </TabsContent>
                    <TabsContent value="shows">
                        <ItemsGridPage title={t('shows')} state={showsState} result={showsResult} />
                    </TabsContent>
                </Tabs>
            )}
        </Page>
    );
};

export default CollectionTabPage;
