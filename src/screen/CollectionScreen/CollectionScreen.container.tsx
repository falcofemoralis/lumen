/* eslint-disable max-len */
import { useNavigation } from '@react-navigation/native';
import { useConfigContext } from 'Context/ConfigContext';
import { useServiceContext } from 'Context/ServiceContext';
import { useEffect, useRef, useState } from 'react';
import NotificationStore from 'Store/Notification.store';
import { ContentCollectionInterface } from 'Type/ContentCollection.interface';
import { openCategory } from 'Util/Router';

import CollectionScreenComponent from './CollectionScreen.component';
import CollectionScreenComponentTV from './CollectionScreen.component.atv';

export function CollectionScreenContainer() {
  const { isTV } = useConfigContext();
  const { currentService } = useServiceContext();
  const [items, setItems] = useState<ContentCollectionInterface[]>([]);
  const paginationRef = useRef({
    page: 1,
    totalPages: 1,
  });
  const updatingStateRef = useRef(false);
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);

    loadRecent(1, false).finally(() => {
      setIsLoading(false);
    });
  }, [currentService]);

  useEffect(() => {
    updatingStateRef.current = false;
  }, [items]);

  const loadRecent = async (
    page: number,
    isRefresh: boolean
  ) => {
    const { totalPages } = paginationRef.current;

    if (page > totalPages) {
      return;
    }

    if (!updatingStateRef.current) {
      updatingStateRef.current = true;

      try {
        const {
          items: resItems,
          totalPages: resTotalPages,
        } = await currentService.getCollections(page);

        paginationRef.current = {
          page,
          totalPages: resTotalPages,
        };

        const newItems = isRefresh ? resItems : [...items, ...resItems];

        setItems(newItems);
      } catch (error) {
        NotificationStore.displayError(error as Error);
        updatingStateRef.current = false;
      }
    }
  };

  const onNextLoad = async (isRefresh = false) => {
    const newPage = isRefresh ? 1 : paginationRef.current.page + 1;

    if (newPage <= paginationRef.current.totalPages) {
      await loadRecent(isRefresh ? 1 : newPage, isRefresh);
    }
  };

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
