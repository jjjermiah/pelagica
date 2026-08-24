import { Wand2 } from 'lucide-react';
import { useHarryPotterBoxSet } from '@pelagica/core';
import CollectionTabPage from '../Collection/CollectionTabPage';

const HarryPotterPage = () => {
    const { data: harryPotterBoxSetId, isLoading: loadingBoxSet } = useHarryPotterBoxSet();

    return (
        <CollectionTabPage
            i18nNamespace="harryPotter"
            boxSetId={harryPotterBoxSetId}
            isLoadingBoxSet={loadingBoxSet}
            emptyIcon={<Wand2 />}
        />
    );
};

export default HarryPotterPage;
