/* eslint-disable max-len */
import { useNavigation } from '@react-navigation/native';
import { useIsTV } from 'Context/ConfigContext';
import { useServiceContext } from 'Context/ServiceContext';
import { usePaginatedQuery } from 'Hooks/usePaginatedQuery';
import { ContentCollectionInterface } from 'Type/ContentCollection.interface';
import { queryKeys } from 'Util/Query';
import { openCategory } from 'Util/Router';

import CollectionScreenComponent from './CollectionScreen.component';
import CollectionScreenComponentTV from './CollectionScreen.component.atv';

export function CollectionScreenContainer() {
  const isTV = useIsTV();
  const { currentService } = useServiceContext();
  const navigation = useNavigation();

  const { items, isLoading, onNextLoad } = usePaginatedQuery<ContentCollectionInterface>({
    queryKey: queryKeys.collections(),
    fetchPage: (page) => currentService.getCollections(page),
  });

  const handleOnPress = (item: ContentCollectionInterface) => {
    openCategory(item.url, navigation);
  };

  const containerProps = {
    items,
    isLoading,
    onNextLoad,
    handleOnPress,
  };

  return isTV ? <CollectionScreenComponentTV { ...containerProps } /> : <CollectionScreenComponent { ...containerProps } />;

}

export default CollectionScreenContainer;
