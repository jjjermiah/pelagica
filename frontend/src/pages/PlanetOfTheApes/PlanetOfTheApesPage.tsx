import { Banana } from 'lucide-react';
import { usePlanetOfTheApesBoxSet } from '@pelagica/core';
import CollectionTabPage from '../Collection/CollectionTabPage';

const PlanetOfTheApesPage = () => {
    const { data: planetOfTheApesBoxSetId, isLoading: loadingBoxSet } =
        usePlanetOfTheApesBoxSet();

    return (
        <CollectionTabPage
            i18nNamespace="planetOfTheApes"
            boxSetId={planetOfTheApesBoxSetId}
            isLoadingBoxSet={loadingBoxSet}
            emptyIcon={<Banana className="h-6 w-6" />}
        />
    );
};

export default PlanetOfTheApesPage;
