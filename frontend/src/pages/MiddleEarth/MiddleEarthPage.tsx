import { Crown } from 'lucide-react';
import { useMiddleEarthBoxSet } from '@pelagica/core';
import CollectionTabPage from '../Collection/CollectionTabPage';

const MiddleEarthPage = () => {
    const { data: middleEarthBoxSetId, isLoading: loadingBoxSet } = useMiddleEarthBoxSet();

    return (
        <CollectionTabPage
            i18nNamespace="middleEarth"
            boxSetId={middleEarthBoxSetId}
            isLoadingBoxSet={loadingBoxSet}
            emptyIcon={<Crown className="h-6 w-6" />}
        />
    );
};

export default MiddleEarthPage;
