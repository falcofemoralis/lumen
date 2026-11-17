/* eslint-disable max-len */
import { useNavigation } from '@react-navigation/native';
import { useIsTV } from 'Context/ConfigContext';
import { useQueryClient } from '@tanstack/react-query';
import { unifiedCollectionsService } from '../../source';
import { enabledSourceKey } from '../../source/types/SourceSelection';
import { usePaginatedQuery } from 'Hooks/usePaginatedQuery';
import { ContentCollectionInterface } from 'Type/ContentCollection.interface';
import { queryKeys } from 'Util/Query';
import { openCategory } from 'Util/Router';

import CollectionScreenComponent from './CollectionScreen.component';
import CollectionScreenComponentTV from './CollectionScreen.component.atv';

export function CollectionScreenContainer() {
  const isTV = useIsTV();
  const queryClient = useQueryClient();
  const queryKey = [...queryKeys.collections(), enabledSourceKey()];
  const navigation = useNavigation();

  const { items, isLoading, isFetching, onNextLoad } = usePaginatedQuery<ContentCollectionInterface>({
    queryKey,
    fetchPage: page => unifiedCollectionsService.getCollections(page, page === 1 ? partial => {
      queryClient.setQueryData(queryKey, { pages: [partial], pageParams: [1] });
    } : undefined),
  });

  const handleOnPress = (item: ContentCollectionInterface) => {
    openCategory(item.url, navigation);
  };

  const containerProps = {
    items,
    isLoading,
    onNextLoad: (isRefresh = false) => !isFetching ? onNextLoad(isRefresh) : Promise.resolve(),
    handleOnPress,
  };

  return isTV ? <CollectionScreenComponentTV { ...containerProps } /> : <CollectionScreenComponent { ...containerProps } />;

}

export default CollectionScreenContainer;
