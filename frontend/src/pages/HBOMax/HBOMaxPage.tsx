import { HBOMaxLogo } from '@/components/logos/BrandLogos';
import { useHBOMaxBoxSet } from '@pelagica/core';
import CollectionTabPage from '../Collection/CollectionTabPage';

const HBOMaxPage = () => {
    const { data: hboMaxBoxSetId, isLoading: loadingBoxSet } = useHBOMaxBoxSet();

    return (
        <CollectionTabPage
            i18nNamespace="hboMax"
            boxSetId={hboMaxBoxSetId}
            isLoadingBoxSet={loadingBoxSet}
            emptyIcon={<HBOMaxLogo className="h-6 w-6" />}
            defaultTab="shows"
        />
    );
};

export default HBOMaxPage;
