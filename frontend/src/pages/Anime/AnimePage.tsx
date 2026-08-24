import { Swords } from 'lucide-react';
import { useAnimeBoxSet } from '@pelagica/core';
import CollectionTabPage from '../Collection/CollectionTabPage';

const AnimePage = () => {
    const { data: animeBoxSetId, isLoading: loadingBoxSet } = useAnimeBoxSet();

    return (
        <CollectionTabPage
            i18nNamespace="anime"
            boxSetId={animeBoxSetId}
            isLoadingBoxSet={loadingBoxSet}
            emptyIcon={<Swords />}
            defaultTab="shows"
        />
    );
};

export default AnimePage;
