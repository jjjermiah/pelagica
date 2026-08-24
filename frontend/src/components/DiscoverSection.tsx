import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Check, Clock, Download, EyeOff, ImageOff } from 'lucide-react';
import SectionScroller from '@/components/SectionScroller';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
    useDiscoverTrending,
    useHiddenDiscoverItems,
    useRequestDiscoverItem,
    type DiscoverItem,
} from '@pelagica/core';
import { getDiscoverPosterUrl } from '@/utils/discoverUrls';

export interface DiscoverSectionProps {
    /** TMDB watch provider id, e.g. 8 for Netflix, 1899 for HBO Max, 350 for Apple TV+. */
    provider: number;
    /** ISO 3166-1 region code, e.g. "US". */
    region: string;
}

const POSTER_SIZE_CLASS = 'w-36 lg:w-44 2xl:w-52';
const POSTER_ASPECT_CLASS = 'h-54 lg:h-64 2xl:h-80';

const skeletonItems = Array.from({ length: 6 }, (_, index) => (
    <div key={index} className={POSTER_SIZE_CLASS}>
        <Skeleton className={`w-full ${POSTER_ASPECT_CLASS} rounded-md mb-2`} />
        <Skeleton className="w-4/5 h-4 mb-1" />
        <Skeleton className="w-1/3 h-3" />
    </div>
));

interface DiscoverPosterProps {
    item: DiscoverItem;
    requested: boolean;
    onRequested: (item: DiscoverItem) => void;
    onHide: (item: DiscoverItem) => void;
}

const DiscoverPoster = ({ item, requested, onRequested, onHide }: DiscoverPosterProps) => {
    const { t } = useTranslation('discover');
    const [posterFailed, setPosterFailed] = useState(false);
    const requestMutation = useRequestDiscoverItem();

    const effectiveStatus = requested ? 'pending' : item.status;
    const isRequestable = effectiveStatus === 'none';

    const handleRequest = () => {
        requestMutation.mutate(
            { tmdbId: item.tmdbId, mediaType: item.mediaType },
            {
                onSuccess: () => onRequested(item),
                onError: () => toast.error(t('discover_request_failed')),
            }
        );
    };

    const handleHide = () => {
        onHide(item);
        toast.success(t('discover_hidden'));
    };

    return (
        <div className={`${POSTER_SIZE_CLASS} shrink-0`}>
            <div
                className={`relative overflow-hidden rounded-md group ${POSTER_SIZE_CLASS} ${POSTER_ASPECT_CLASS} bg-muted`}
            >
                {item.posterPath && !posterFailed ? (
                    <img
                        src={getDiscoverPosterUrl(item.posterPath)}
                        alt={item.title}
                        className="w-full h-full object-cover rounded-md transition-all group-hover:scale-105 transform-gpu will-change-transform"
                        loading="lazy"
                        onError={() => setPosterFailed(true)}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <ImageOff className="text-muted-foreground" size={32} />
                    </div>
                )}

                <Button
                    size="icon-sm"
                    variant="secondary"
                    onClick={handleHide}
                    aria-label={t('discover_hide')}
                    title={t('discover_hide')}
                    className="absolute top-1.5 right-1.5 shadow-sm opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
                >
                    <EyeOff />
                </Button>

                {effectiveStatus === 'available' && (
                    <Badge variant="default" className="absolute top-1.5 left-1.5 shadow-sm">
                        <Check />
                        {t('discover_in_library')}
                    </Badge>
                )}

                {(effectiveStatus === 'partial' ||
                    effectiveStatus === 'pending' ||
                    effectiveStatus === 'processing') && (
                    <Badge variant="secondary" className="absolute top-1.5 left-1.5 shadow-sm">
                        <Clock />
                        {t('discover_requested')}
                    </Badge>
                )}

                {isRequestable && (
                    <div className="absolute inset-x-0 bottom-0 flex justify-center p-2 pt-6 bg-gradient-to-t from-black/85 to-transparent opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                        <Button
                            size="sm"
                            onClick={handleRequest}
                            disabled={requestMutation.isPending}
                        >
                            <Download />
                            {requestMutation.isPending
                                ? t('discover_requesting')
                                : t('discover_request')}
                        </Button>
                    </div>
                )}
            </div>
            <p
                className={`mt-2 text-sm line-clamp-1 text-ellipsis break-all max-w-36 lg:max-w-44 2xl:max-w-52`}
            >
                {item.title}
            </p>
            {item.year && <span className="text-xs text-muted-foreground mt-1">{item.year}</span>}
            {item.tmdbRating != null && (
                <div className="flex items-center gap-1 mt-1">
                    <span
                        className="inline-flex items-center gap-1 rounded-sm bg-[#0d253f] px-1.5 py-0.5 text-[10px] font-bold leading-none"
                        title={t('discover_rating_tmdb', { rating: item.tmdbRating.toFixed(1) })}
                    >
                        <span className="text-[#01b4e4]">TMDB</span>
                        <span className="text-white">{item.tmdbRating.toFixed(1)}</span>
                    </span>
                </div>
            )}
        </div>
    );
};

const itemKey = (item: DiscoverItem) => `${item.mediaType}-${item.tmdbId}`;

/**
 * Trending-titles row for a streaming platform page (Apple TV+, HBO Max,
 * Netflix), sourced from Jellyseerr/TMDB via the backend `/api/discover`
 * endpoint. Renders nothing once settled if the backend reports the feature
 * isn't configured (503) or fails outright — this is an optional feature,
 * not every deployer runs Jellyseerr.
 */
const DiscoverSection = ({ provider, region }: DiscoverSectionProps) => {
    const { t } = useTranslation('discover');
    const {
        movies: allMovies,
        shows: allShows,
        isLoading,
        notConfigured,
    } = useDiscoverTrending({
        provider,
        region,
    });
    const { hiddenKeys, hideItem } = useHiddenDiscoverItems();
    // Already-in-library titles add no value in a discovery row — filter them out
    // rather than badging them, so every card shown is actually requestable.
    // Items the user chose to hide are excluded regardless of which network
    // page they'd otherwise appear on (hidden state isn't per-provider).
    const movies = allMovies.filter(
        (item) => item.status !== 'available' && !hiddenKeys.has(itemKey(item))
    );
    const shows = allShows.filter(
        (item) => item.status !== 'available' && !hiddenKeys.has(itemKey(item))
    );
    const [requestedKeys, setRequestedKeys] = useState<Set<string>>(new Set());

    const markRequested = (item: DiscoverItem) => {
        setRequestedKeys((prev) => {
            const next = new Set(prev);
            next.add(itemKey(item));
            return next;
        });
    };

    if (notConfigured) return null;
    if (!isLoading && movies.length === 0 && shows.length === 0) return null;

    const renderRow = (title: string, items: DiscoverItem[]) => {
        if (isLoading) {
            return (
                <SectionScroller
                    title={<h3 className="text-xl font-semibold">{title}</h3>}
                    items={skeletonItems}
                />
            );
        }
        if (items.length === 0) return null;
        return (
            <SectionScroller
                title={<h3 className="text-xl font-semibold">{title}</h3>}
                items={items.map((item) => (
                    <DiscoverPoster
                        key={itemKey(item)}
                        item={item}
                        requested={requestedKeys.has(itemKey(item))}
                        onRequested={markRequested}
                        onHide={(hidden) => hideItem(itemKey(hidden))}
                    />
                ))}
            />
        );
    };

    return (
        <div className="flex flex-col gap-8 mt-10">
            <h2 className="text-2xl font-bold">{t('discover_heading')}</h2>
            {renderRow(t('discover_trending_movies'), movies)}
            {renderRow(t('discover_trending_shows'), shows)}
        </div>
    );
};

export default DiscoverSection;
