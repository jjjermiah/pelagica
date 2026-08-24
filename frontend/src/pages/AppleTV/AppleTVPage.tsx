import { AppleTVLogo } from '@/components/logos/BrandLogos';
import { useAppleTVBoxSet } from '@pelagica/core';
import CollectionTabPage from '../Collection/CollectionTabPage';

const AppleTVPage = () => {
    const { data: appleTVBoxSetId, isLoading: loadingBoxSet } = useAppleTVBoxSet();

    return (
        <CollectionTabPage
            i18nNamespace="appleTV"
            boxSetId={appleTVBoxSetId}
            isLoadingBoxSet={loadingBoxSet}
            emptyIcon={<AppleTVLogo className="h-6 w-6" />}
            defaultTab="shows"
        />
    );
};

export default AppleTVPage;
