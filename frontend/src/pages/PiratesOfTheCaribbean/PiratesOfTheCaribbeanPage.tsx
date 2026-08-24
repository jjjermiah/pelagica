import { Ship } from 'lucide-react';
import { usePiratesOfTheCaribbeanBoxSet } from '@pelagica/core';
import CollectionTabPage from '../Collection/CollectionTabPage';

const PiratesOfTheCaribbeanPage = () => {
    const { data: piratesOfTheCaribbeanBoxSetId, isLoading: loadingBoxSet } =
        usePiratesOfTheCaribbeanBoxSet();

    return (
        <CollectionTabPage
            i18nNamespace="piratesOfTheCaribbean"
            boxSetId={piratesOfTheCaribbeanBoxSetId}
            isLoadingBoxSet={loadingBoxSet}
            emptyIcon={<Ship className="h-6 w-6" />}
        />
    );
};

export default PiratesOfTheCaribbeanPage;
