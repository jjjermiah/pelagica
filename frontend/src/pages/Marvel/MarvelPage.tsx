import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Clapperboard, Shield, Tv } from 'lucide-react';
import type { BaseItemKind } from '@jellyfin/sdk/lib/generated-client/models';
import { useMarvelBoxSet, useSectionItems } from '@pelagica/core';
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

type MarvelTab = 'movies' | 'shows';

const MarvelPageSkeleton = () => (
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

const MarvelPage = () => {
    const { t } = useTranslation('marvel');
    const [activeTab, setActiveTab] = useState<MarvelTab>('movies');
    const { data: marvelBoxSetId, isLoading: loadingBoxSet } = useMarvelBoxSet();
    const state = useItemsGridState();

    const moviesResult = useSectionItems(
        marvelBoxSetId && activeTab === 'movies'
            ? { libraryId: marvelBoxSetId, types: MOVIE_TYPES }
            : undefined,
        state.params
    );
    const showsResult = useSectionItems(
        marvelBoxSetId && activeTab === 'shows'
            ? { libraryId: marvelBoxSetId, types: SERIES_TYPES }
            : undefined,
        state.params
    );

    const handleTabChange = (value: string) => {
        setActiveTab(value === 'shows' ? 'shows' : 'movies');
        state.setPage(0);
    };

    return (
        <Page title={t('title')} requiresAuth pagePadding>
            {loadingBoxSet && <MarvelPageSkeleton />}

            {!loadingBoxSet && !marvelBoxSetId && (
                <Empty>
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <Shield />
                        </EmptyMedia>
                        <EmptyTitle>{t('no_collection_title')}</EmptyTitle>
                        <EmptyDescription>{t('no_collection_description')}</EmptyDescription>
                    </EmptyHeader>
                </Empty>
            )}

            {!loadingBoxSet && marvelBoxSetId && (
                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
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

                    <TabsContent value="movies">
                        <ItemsGridPage title={t('movies')} state={state} result={moviesResult} />
                    </TabsContent>
                    <TabsContent value="shows">
                        <ItemsGridPage title={t('shows')} state={state} result={showsResult} />
                    </TabsContent>
                </Tabs>
            )}
        </Page>
    );
};

export default MarvelPage;
