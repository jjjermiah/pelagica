import { Drama } from 'lucide-react';
import { useHBOMaxBoxSet } from '@pelagica/core';
import CollectionTabPage from '../Collection/CollectionTabPage';

const HBOMaxPage = () => {
    const { data: hboMaxBoxSetId, isLoading: loadingBoxSet } = useHBOMaxBoxSet();

    return (
        <CollectionTabPage
            i18nNamespace="hboMax"
            boxSetId={hboMaxBoxSetId}
            isLoadingBoxSet={loadingBoxSet}
            emptyIcon={<Drama />}
        />
    );
};

export default HBOMaxPage;
