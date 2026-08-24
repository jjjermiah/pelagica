import { Skeleton } from '@/components/ui/skeleton';
import { getPrimaryImageUrl, useBoxSetItems, useConfig } from '@pelagica/core';
import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client/models';
import type { TFunction } from 'i18next';
import { ChevronLeft, ChevronRight, ImageOff, Play } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { buildPlayerUrl } from '@/utils/playerUrl';
import { getItemUrl } from '@/utils/itemUrl';
import WatchedStateBadge from '@/components/WatchedStateBadge';
import ItemContextMenu from '@/components/ItemContextMenu';
import SeriesResumeSubtitle from '@/components/SeriesResumeSubtitle';

// BoxSet child posters are only ever shown in the default 2/3 library grid
// (Collections view never overrides the poster size), so a fixed size is safe here.
const BOXSET_CHILD_POSTER_SIZE = { width: 416, height: 640 };

const LibraryItem = ({
    item,
    posterUrl,
    t,
    posterAspectRatio = '2/3',
    posterFit = 'cover',
    detailLine,
    isDirectPlay,
    itemLink,
}: {
    item: BaseItemDto;
    posterUrl: string;
    t: TFunction;
    posterAspectRatio?: string;
    posterFit?: 'cover' | 'contain';
    detailLine?: React.ReactNode;
    isDirectPlay?: boolean;
    itemLink?: string;
}) => {
    const { config } = useConfig();
    const navigate = useNavigate();
    const location = useLocation();
    const [posterError, setPosterError] = useState(false);

    const isBoxSet = item.Type === 'BoxSet';
    const [boxSetIndex, setBoxSetIndex] = useState(0);
    const [wantsBoxSetItems, setWantsBoxSetItems] = useState(false);

    // Lazy: only fetch a collection's children once the card is actually hovered.
    const { data: boxSetItems } = useBoxSetItems(
        isBoxSet && wantsBoxSetItems ? item.Id : null
    );

    const boxSetChildrenWithImages = useMemo(
        () => (boxSetItems ?? []).filter((child) => child.Id && child.ImageTags?.Primary),
        [boxSetItems]
    );

    const activeBoxSetChild = boxSetChildrenWithImages.length
        ? boxSetChildrenWithImages[boxSetIndex % boxSetChildrenWithImages.length]
        : undefined;

    const showBoxSetArrows = isBoxSet && boxSetChildrenWithImages.length > 1;

    const resolvedPosterUrl =
        isBoxSet && activeBoxSetChild?.Id
            ? getPrimaryImageUrl(
                  activeBoxSetChild.Id,
                  BOXSET_CHILD_POSTER_SIZE,
                  activeBoxSetChild.ImageTags?.Primary
              )
            : posterUrl;

    const handleBoxSetHover = () => {
        if (isBoxSet && !wantsBoxSetItems) setWantsBoxSetItems(true);
    };

    const handlePrevBoxSetChild = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setPosterError(false);
        setBoxSetIndex(
            (prev) =>
                (prev - 1 + boxSetChildrenWithImages.length) % boxSetChildrenWithImages.length
        );
    };

    const handleNextBoxSetChild = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setPosterError(false);
        setBoxSetIndex((prev) => (prev + 1) % boxSetChildrenWithImages.length);
    };

    const playUrl = buildPlayerUrl(item.Id!, location.pathname + location.search);
    const itemPath =
        itemLink ||
        (isDirectPlay ? playUrl : getItemUrl(item.Type, item.Id) ?? `/item/${item.Id}`);

    const watched = item.UserData?.PlaybackPositionTicks ?? 0;
    const runtime = item.RunTimeTicks ?? 0;
    const progress = isDirectPlay
        ? item.UserData?.Played && watched <= 0
            ? 100
            : runtime > 0
              ? (watched / runtime) * 100
              : 0
        : 0;
    
    return (
        <ItemContextMenu item={item}>
            <Link to={itemPath} key={item.Id} className="p-0 m-0">
            <div
                className={`relative w-full aspect-${posterAspectRatio} overflow-hidden rounded-md group`}
                onMouseEnter={handleBoxSetHover}
            >
                {!posterError ? (
                    <>
                        <img
                            key={activeBoxSetChild?.Id ?? item.Id}
                            src={resolvedPosterUrl}
                            alt={item.Name || t('library:no_title')}
                            className={`w-full h-full object-${posterFit} rounded-md group-hover:opacity-75 transition-all group-hover:scale-105 z-10`}
                            loading="lazy"
                            onError={() => setPosterError(true)}
                        />
                        <Skeleton className="absolute bottom-0 left-0 right-0 top-0 -z-1" />
                        {isDirectPlay && (
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                <div
                                    className="bg-black/60 rounded-full p-4 cursor-pointer hover:bg-black/75"
                                    role="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        navigate(itemLink || playUrl);
                                    }}
                                >
                                    <Play className="w-6 h-6 text-white fill-white" />
                                </div>
                            </div>
                        )}
                        {showBoxSetArrows && (
                            <>
                                <button
                                    type="button"
                                    aria-label={t('library:previous_collection_item')}
                                    className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-30 bg-black/60 hover:bg-black/75 rounded-full p-1.5 cursor-pointer"
                                    onClick={handlePrevBoxSetChild}
                                >
                                    <ChevronLeft className="w-4 h-4 text-white" />
                                </button>
                                <button
                                    type="button"
                                    aria-label={t('library:next_collection_item')}
                                    className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-30 bg-black/60 hover:bg-black/75 rounded-full p-1.5 cursor-pointer"
                                    onClick={handleNextBoxSetChild}
                                >
                                    <ChevronRight className="w-4 h-4 text-white" />
                                </button>
                            </>
                        )}
                        <div className="absolute inset-0 rounded-md pointer-events-none poster-card-outline z-20" />
                    </>
                ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center rounded-md">
                        <ImageOff className="text-4xl text-muted-foreground" />
                    </div>
                )}
                <WatchedStateBadge item={item} show={config?.watchedStateBadgeLibrary || false} />
                {progress > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700 z-20">
                        <div
                            style={{ width: `${progress}%` }}
                            className="h-full bg-brand transition-[width]"
                        />
                    </div>
                )}
            </div>
            <p className="mt-2 text-sm line-clamp-1 text-ellipsis break-all">
                {item.Name || t('library:no_title')}
            </p>
            <div className="flex flex-wrap items-center">
                <span className="text-xs text-muted-foreground mr-3 line-clamp-1">
                    {detailLine}
                </span>
            </div>
            {item.Type === 'Series' && <SeriesResumeSubtitle seriesId={item.Id} />}
        </Link>
        </ItemContextMenu>
    );
};

export default LibraryItem;