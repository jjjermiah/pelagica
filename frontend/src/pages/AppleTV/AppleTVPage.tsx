import { Apple } from 'lucide-react';
import { useAppleTVBoxSet } from '@pelagica/core';
import CollectionTabPage from '../Collection/CollectionTabPage';

const AppleTVPage = () => {
    const { data: appleTVBoxSetId, isLoading: loadingBoxSet } = useAppleTVBoxSet();

    return (
        <CollectionTabPage
            i18nNamespace="appleTV"
            boxSetId={appleTVBoxSetId}
            isLoadingBoxSet={loadingBoxSet}
            emptyIcon={<Apple />}
        />
    );
};

export default AppleTVPage;
