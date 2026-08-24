import { MonitorPlay } from 'lucide-react';
import { useNetflixBoxSet } from '@pelagica/core';
import CollectionTabPage from '../Collection/CollectionTabPage';
import DiscoverSection from '@/components/DiscoverSection';

const NETFLIX_TMDB_PROVIDER_ID = 8;

const NetflixPage = () => {
    const { data: netflixBoxSetId, isLoading: loadingBoxSet } = useNetflixBoxSet();

    return (
        <CollectionTabPage
            i18nNamespace="netflix"
            boxSetId={netflixBoxSetId}
            isLoadingBoxSet={loadingBoxSet}
            emptyIcon={<MonitorPlay />}
            defaultTab="shows"
            belowContent={<DiscoverSection provider={NETFLIX_TMDB_PROVIDER_ID} region="US" />}
        />
    );
};

export default NetflixPage;
