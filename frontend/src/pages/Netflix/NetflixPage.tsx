import { NetflixLogo } from '@/components/logos/BrandLogos';
import { useNetflixBoxSet } from '@pelagica/core';
import CollectionTabPage from '../Collection/CollectionTabPage';

const NetflixPage = () => {
    const { data: netflixBoxSetId, isLoading: loadingBoxSet } = useNetflixBoxSet();

    return (
        <CollectionTabPage
            i18nNamespace="netflix"
            boxSetId={netflixBoxSetId}
            isLoadingBoxSet={loadingBoxSet}
            emptyIcon={<NetflixLogo className="h-6 w-6" />}
            defaultTab="shows"
        />
    );
};

export default NetflixPage;
