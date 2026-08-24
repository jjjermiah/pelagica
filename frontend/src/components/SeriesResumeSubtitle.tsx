import { getUserId, ticksToReadableTime, useSeriesNextUp } from '@pelagica/core';
import { useTranslation } from 'react-i18next';

interface SeriesResumeSubtitleProps {
    /** Series item id. Pass only for `item.Type === 'Series'` cards. */
    seriesId: string | null | undefined;
}

/**
 * Small subtitle line for Series cards showing the last-watched / next-to-resume
 * episode (e.g. "S2 E4") and, if that episode was partially watched, the
 * remaining time (e.g. "S2 E4 · 12m left") plus a thin progress bar.
 *
 * Renders nothing if there is no next-up episode for the series (nothing
 * watched/started, or the series is fully watched).
 */
const SeriesResumeSubtitle = ({ seriesId }: SeriesResumeSubtitleProps) => {
    const { t } = useTranslation('item');
    const { data: nextUpEpisode } = useSeriesNextUp(seriesId, getUserId() ?? undefined);

    if (
        !nextUpEpisode ||
        nextUpEpisode.IndexNumber == null ||
        nextUpEpisode.ParentIndexNumber == null
    ) {
        return null;
    }

    const watched = nextUpEpisode.UserData?.PlaybackPositionTicks ?? 0;
    const runtime = nextUpEpisode.RunTimeTicks ?? 0;
    const inProgress = watched > 0 && runtime > watched;
    const progressPercent = inProgress ? (watched / runtime) * 100 : 0;

    const episodeLabel = t('season_episode', {
        season: nextUpEpisode.ParentIndexNumber,
        episode: nextUpEpisode.IndexNumber,
    });

    return (
        <div className="mt-1 flex flex-col gap-1">
            <span className="text-xs text-muted-foreground line-clamp-1">
                {inProgress
                    ? `${episodeLabel} · ${t('resume_time_left', {
                          time: ticksToReadableTime(runtime - watched),
                      })}`
                    : episodeLabel}
            </span>
            {inProgress && (
                <div className="h-1 w-full rounded-full bg-gray-700 overflow-hidden">
                    <div
                        style={{ width: `${progressPercent}%` }}
                        className="h-full bg-brand transition-[width]"
                    />
                </div>
            )}
        </div>
    );
};

export default SeriesResumeSubtitle;
