import { Bot } from 'lucide-react';
import { useTransformersBoxSet } from '@pelagica/core';
import CollectionTabPage from '../Collection/CollectionTabPage';

const TransformersPage = () => {
    const { data: transformersBoxSetId, isLoading: loadingBoxSet } = useTransformersBoxSet();

    return (
        <CollectionTabPage
            i18nNamespace="transformers"
            boxSetId={transformersBoxSetId}
            isLoadingBoxSet={loadingBoxSet}
            emptyIcon={<Bot className="h-6 w-6" />}
        />
    );
};

export default TransformersPage;
