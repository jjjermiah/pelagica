import { HarryPotterLogo } from '@/components/logos/BrandLogos';
import { useHarryPotterBoxSet } from '@pelagica/core';
import CollectionTabPage from '../Collection/CollectionTabPage';

const HarryPotterPage = () => {
    const { data: harryPotterBoxSetId, isLoading: loadingBoxSet } = useHarryPotterBoxSet();

    return (
        <CollectionTabPage
            i18nNamespace="harryPotter"
            boxSetId={harryPotterBoxSetId}
            isLoadingBoxSet={loadingBoxSet}
            emptyIcon={<HarryPotterLogo className="h-6 w-6" />}
        />
    );
};

export default HarryPotterPage;
