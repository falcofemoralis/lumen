import { FlashList } from '@shopify/flash-list';
import { FilmCard } from 'Component/FilmCard';
import { FilmCardThumbnail } from 'Component/FilmCard/FilmCard.thumbnail';
import { memo, useCallback, useMemo } from 'react';
import { Pressable, RefreshControl, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from 'Theme/context';
import { FilmType } from 'Type/FilmType.type';

import { THUMBNAILS_ROWS } from './FilmGrid.config';
import { ROW_GAP } from './FilmGrid.style';
import { FilmGridComponentProps, FilmGridItemProps, FilmGridRowItem } from './FilmGrid.type';

function FilmGridItem({
  item,
  handleOnPress,
}: FilmGridItemProps) {
  const { scale } = useAppTheme();

  const style = useMemo(() => ({
    marginHorizontal: scale(ROW_GAP) / 2,
  }), [scale]);

  if (item.isPlaceholder) {
    return (
      <View style={ style }>
        <FilmCardThumbnail />
      </View>
    );
  }

  return (
    <Pressable
      style={ style }
      onPress={ () => handleOnPress(item) }
    >
      <FilmCard filmCard={ item } />
    </Pressable>
  );
}

const MemoizedGridItem = memo(FilmGridItem);

export function FilmGridComponent({
  films,
  disableEmptyComponent,
  isEmpty,
  hideGrid,
  numberOfColumns,
  disableStatusbarSafeArea,
  isRefreshing,
  ListEmptyComponent,
  handleOnPress,
  handleScrollEnd,
  handleRefresh,
}: FilmGridComponentProps) {
  const { scale } = useAppTheme();
  const { top } = useSafeAreaInsets();

  const renderItem = useCallback(({ item, index }: { item: FilmGridRowItem, index: number }) => (
    <MemoizedGridItem
      index={ index }
      item={ item }
      handleOnPress={ handleOnPress }
    />
  ), [handleOnPress]);

  const filmsData = useMemo(() => {
    if (isEmpty || hideGrid) {
      return [];
    }

    if (!films.length) {
      return new Array(numberOfColumns * THUMBNAILS_ROWS).fill(null).map((_, index) => ({
        id: `film-placeholder-${index}`,
        link: '',
        type: FilmType.FILM,
        poster: '',
        title: '',
        subtitle: '',
        isPlaceholder: true,
      }));
    }

    return films;
  }, [isEmpty, hideGrid, films, numberOfColumns]);

  const contentContainerStyle = useMemo(() => ({
    padding: scale(ROW_GAP) / 2,
  }), [scale]);

  const ItemSeparator = useCallback(() => (
    <View style={ { height: scale(ROW_GAP) } } />
  ), [scale]);

  const keyExtractor = useCallback((item: FilmGridRowItem) => item.id, []);

  const getItemType = useCallback(
    (item: FilmGridRowItem) => (item.isPlaceholder ? 'placeholder' : 'film'),
    []
  );

  const ListHeaderComponent = useMemo(() => (
    disableStatusbarSafeArea ? null : <View style={ { height: top } } />
  ), [disableStatusbarSafeArea, top]);

  const refreshControl = useMemo(() => (
    <RefreshControl
      refreshing={ isRefreshing }
      onRefresh={ handleRefresh }
    />
  ), [isRefreshing, handleRefresh]);

  return (
    <FlashList
      data={ filmsData }
      renderItem={ renderItem }
      keyExtractor={ keyExtractor }
      getItemType={ getItemType }
      onEndReached={ handleScrollEnd }
      onEndReachedThreshold={ 0.25 }
      numColumns={ numberOfColumns }
      contentContainerStyle={ contentContainerStyle }
      ItemSeparatorComponent={ ItemSeparator }
      ListHeaderComponent={ ListHeaderComponent }
      ListEmptyComponent={ disableEmptyComponent || hideGrid ? undefined : ListEmptyComponent }
      refreshControl={ refreshControl }
      showsVerticalScrollIndicator={ false }
      removeClippedSubviews={ true }
    />
  );
}

export default FilmGridComponent;
