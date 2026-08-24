import { MonitorPlay } from 'lucide-react';
import { useNetflixBoxSet } from '@pelagica/core';
import CollectionTabPage from '../Collection/CollectionTabPage';

const NetflixPage = () => {
    const { data: netflixBoxSetId, isLoading: loadingBoxSet } = useNetflixBoxSet();

    return (
        <CollectionTabPage
            i18nNamespace="netflix"
            boxSetId={netflixBoxSetId}
            isLoadingBoxSet={loadingBoxSet}
            emptyIcon={<MonitorPlay />}
        />
    );
};

export default NetflixPage;
