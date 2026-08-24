import { Drama } from 'lucide-react';
import { useHBOMaxBoxSet } from '@pelagica/core';
import CollectionTabPage from '../Collection/CollectionTabPage';
import DiscoverSection from '@/components/DiscoverSection';

const HBO_MAX_TMDB_PROVIDER_ID = 1899;

const HBOMaxPage = () => {
    const { data: hboMaxBoxSetId, isLoading: loadingBoxSet } = useHBOMaxBoxSet();

    return (
        <CollectionTabPage
            i18nNamespace="hboMax"
            boxSetId={hboMaxBoxSetId}
            isLoadingBoxSet={loadingBoxSet}
            emptyIcon={<Drama />}
            defaultTab="shows"
            belowContent={<DiscoverSection provider={HBO_MAX_TMDB_PROVIDER_ID} region="US" />}
        />
    );
};

export default HBOMaxPage;
