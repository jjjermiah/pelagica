import { Star } from 'lucide-react';
import { useDCUniverseBoxSet } from '@pelagica/core';
import CollectionTabPage from '../Collection/CollectionTabPage';

const DCUniversePage = () => {
    const { data: dcUniverseBoxSetId, isLoading: loadingBoxSet } = useDCUniverseBoxSet();

    return (
        <CollectionTabPage
            i18nNamespace="dcUniverse"
            boxSetId={dcUniverseBoxSetId}
            isLoadingBoxSet={loadingBoxSet}
            emptyIcon={<Star />}
        />
    );
};

export default DCUniversePage;
