import { Shield } from 'lucide-react';
import { useMarvelBoxSet } from '@pelagica/core';
import CollectionTabPage from '../Collection/CollectionTabPage';

const MarvelPage = () => {
    const { data: marvelBoxSetId, isLoading: loadingBoxSet } = useMarvelBoxSet();

    return (
        <CollectionTabPage
            i18nNamespace="marvel"
            boxSetId={marvelBoxSetId}
            isLoadingBoxSet={loadingBoxSet}
            emptyIcon={<Shield />}
        />
    );
};

export default MarvelPage;
