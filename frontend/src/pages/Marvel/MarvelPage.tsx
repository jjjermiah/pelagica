import { MarvelLogo } from '@/components/logos/BrandLogos';
import { useMarvelBoxSet } from '@pelagica/core';
import CollectionTabPage from '../Collection/CollectionTabPage';

const MarvelPage = () => {
    const { data: marvelBoxSetId, isLoading: loadingBoxSet } = useMarvelBoxSet();

    return (
        <CollectionTabPage
            i18nNamespace="marvel"
            boxSetId={marvelBoxSetId}
            isLoadingBoxSet={loadingBoxSet}
            emptyIcon={<MarvelLogo className="h-6 w-6" />}
        />
    );
};

export default MarvelPage;
