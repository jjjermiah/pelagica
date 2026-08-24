import { Apple } from 'lucide-react';
import { useAppleTVBoxSet } from '@pelagica/core';
import CollectionTabPage from '../Collection/CollectionTabPage';
import DiscoverSection from '@/components/DiscoverSection';

const APPLE_TV_TMDB_PROVIDER_ID = 350;

const AppleTVPage = () => {
    const { data: appleTVBoxSetId, isLoading: loadingBoxSet } = useAppleTVBoxSet();

    return (
        <CollectionTabPage
            i18nNamespace="appleTV"
            boxSetId={appleTVBoxSetId}
            isLoadingBoxSet={loadingBoxSet}
            emptyIcon={<Apple />}
            defaultTab="shows"
            belowContent={<DiscoverSection provider={APPLE_TV_TMDB_PROVIDER_ID} region="US" />}
        />
    );
};

export default AppleTVPage;
