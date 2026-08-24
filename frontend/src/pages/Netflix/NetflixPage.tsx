import { NetflixLogo } from '@/components/logos/BrandLogos';
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
            emptyIcon={<NetflixLogo className="h-6 w-6" />}
            defaultTab="shows"
            belowContent={<DiscoverSection provider={NETFLIX_TMDB_PROVIDER_ID} region="US" />}
        />
    );
};

export default NetflixPage;
