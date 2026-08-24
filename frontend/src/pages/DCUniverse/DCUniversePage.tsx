import { DCLogo } from '@/components/logos/BrandLogos';
import { useDCUniverseBoxSet } from '@pelagica/core';
import CollectionTabPage from '../Collection/CollectionTabPage';

const DCUniversePage = () => {
    const { data: dcUniverseBoxSetId, isLoading: loadingBoxSet } = useDCUniverseBoxSet();

    return (
        <CollectionTabPage
            i18nNamespace="dcUniverse"
            boxSetId={dcUniverseBoxSetId}
            isLoadingBoxSet={loadingBoxSet}
            emptyIcon={<DCLogo className="h-6 w-6" />}
        />
    );
};

export default DCUniversePage;
