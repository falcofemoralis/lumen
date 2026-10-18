import { sameGridCardProps } from './FilmGrid.memo';
import { FlashList, FlashListRef, ViewToken } from '@shopify/flash-list';
import { FilmCard } from 'Component/FilmCard';
import { FilmCardThumbnail } from 'Component/FilmCard/FilmCard.thumbnail';
import { Loader } from 'Component/Loader';
import { ThemedSafeArea } from 'Component/ThemedSafeArea';
import { ThemedText } from 'Component/ThemedText';
import { ScrollToTopButton } from 'Component/ScrollToTopButton';
import { Portal } from 'Component/ThemedPortal';
import { useConfigContext } from 'Context/ConfigContext';
import { useIsScreenFocused } from 'Hooks/useIsScreenFocused';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { usePosterPrefetch } from 'Hooks/usePosterPrefetch';
import { ComponentType, memo, ReactElement, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, Pressable, RefreshControl, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from 'Theme/context';
import { ThemedStyles } from 'Theme/types';

import { componentStyles, ROW_GAP } from './FilmGrid.style';
import { SCROLL_SHOW_THRESHOLD } from 'Component/ScrollToTopButton/ScrollToTopButton.config';
import {
  FilmGridComponentProps,
  FilmGridHeaderProps,
  FilmGridItem,
  FilmGridItemProps,
  FilmGridItemType,
} from './FilmGrid.type';

type Styles = ThemedStyles<typeof componentStyles>;

const FilmGridHeader = ({
  header,
  styles,
}: FilmGridHeaderProps & { styles: Styles }) => (
  <View style={ styles.header }>
    <ThemedText style={ styles.headerText }>
      { header }
    </ThemedText>
  </View>
);

function FilmGridItemCard({
  item,
  handleOnPress,
  isRatingVisible,
  filmActions,
}: FilmGridItemProps) {
  const { isPlaceholder, film } = item;
  const { scale } = useAppTheme();

  const style = useMemo(() => ({
    marginHorizontal: scale(ROW_GAP) / 2,
  }), [scale]);

  if (isPlaceholder) {
    return (
      <View style={ style }>
        <FilmCardThumbnail />
      </View>
    );
  }

  return (
    <View style={ style }>
      <Pressable onPress={ () => handleOnPress(film) }>
        <FilmCard
          filmCard={ film }
          isRatingVisible={ isRatingVisible }
        />
      </Pressable>
      { filmActions?.(film) }
    </View>
  );
}

const MemoizedHeader = memo(FilmGridHeader);
const MemoizedGridItem = memo(FilmGridItemCard, sameGridCardProps);

export function FilmGridComponent({
  data,
  stickyHeaderIndices,
  hasFilms,
  numberOfColumns,
  disableEmptyComponent,
  hideGrid,
  disableStatusbarSafeArea,
  isRefreshing,
  isLoadingNext,
  hasMorePages,
  ListHeaderComponent,
  ListEmptyComponent,
  centerEmptyComponent,
  handleOnPress,
  filmActions,
  handleScrollEnd,
  handleRefresh,
  tabPosition = 'bottom',
  showScrollToTopButton,
}: FilmGridComponentProps) {
  const styles = useThemedStyles(componentStyles);
  const { scale } = useAppTheme();
  const { top: safeAreaTop } = useSafeAreaInsets();
  const { scrollToTopButtonEnabled } = useConfigContext();
  const isScreenFocused = useIsScreenFocused();
  const isScrollToTopButtonActive = showScrollToTopButton && scrollToTopButtonEnabled && isScreenFocused;
  const listRef = useRef<FlashListRef<FilmGridItem>>(null);
  const [visibleFilmIds, setVisibleFilmIds] = useState<Set<string>>(new Set());
  const [isScrolledDown, setIsScrolledDown] = useState(false);

  const viewabilityConfig = useMemo(() => ({
    itemVisiblePercentThreshold: 50,
  }), []);

  const prefetchPosters = usePosterPrefetch(data, numberOfColumns);
  const onViewableItemsChanged = useCallback(({
    viewableItems,
  }: { viewableItems: ViewToken<FilmGridItem>[] }) => {
    const indexes = viewableItems.filter(token => token.isViewable && token.index !== null).map(token => token.index!);
    if (indexes.length) prefetchPosters(Math.max(...indexes));
    const nextVisible = new Set(
      viewableItems
        .filter((token) => token.isViewable && token.item.type === FilmGridItemType.FILM)
        .map((token) => token.item.type === FilmGridItemType.FILM ? token.item.film.id : '')
        .filter(Boolean)
    );
    setVisibleFilmIds(previous => (
      previous.size === nextVisible.size && [...nextVisible].every(id => previous.has(id)) ? previous : nextVisible
    ));
  }, [prefetchPosters]);

  const renderItem = useCallback(({ item }: { item: FilmGridItem }) => {
    if (item.type === FilmGridItemType.HEADER) {
      return (
        <MemoizedHeader
          header={ item.header }
          styles={ styles }
        />
      );
    }

    return (
      <MemoizedGridItem
        item={ item }
        handleOnPress={ handleOnPress }
        isRatingVisible={
          item.type === FilmGridItemType.FILM
          && visibleFilmIds.has(item.film.id)
        }
        filmActions={ filmActions }
      />
    );
  }, [styles, handleOnPress, visibleFilmIds, filmActions]);

  // Headers and cards differ wildly in height, so recycle them separately --
  // and so do real cards and their loading placeholders.
  const getItemType = useCallback((item: FilmGridItem) => {
    if (item.type !== FilmGridItemType.FILM) {
      return item.type;
    }

    return item.isPlaceholder ? 'placeholder' : FilmGridItemType.FILM;
  }, []);

  // Cards take one grid column; a header takes the whole width, which also
  // pushes the next section onto a fresh row.
  const overrideItemLayout = useCallback((
    layout: { span?: number },
    item: FilmGridItem
  ) => {
    layout.span = item.type === FilmGridItemType.HEADER ? numberOfColumns : 1;
  }, [numberOfColumns]);

  const keyExtractor = useCallback((item: FilmGridItem) => item.key, []);

  const ItemSeparator = useCallback(() => (
    <View style={ { height: scale(ROW_GAP) } } />
  ), [scale]);

  const renderSafeArea = useCallback((children?: ComponentType<any> | ReactElement | null) => {
    if (disableStatusbarSafeArea) {
      return children;
    }

    return (
      <ThemedSafeArea>
        { children as ReactNode }
      </ThemedSafeArea>
    );
  }, [disableStatusbarSafeArea]);

  // A caller-supplied header replaces the status bar spacer -- it is expected
  // to carry the inset itself.
  const listHeader = useMemo(
    () => ListHeaderComponent ? renderSafeArea(ListHeaderComponent) : undefined,
    [ListHeaderComponent, renderSafeArea],
  );

  // Tells a list that is still growing apart from one that has ended: a long
  // grid otherwise just stops, with nothing to say whether the bottom is the
  // bottom or the next page is on its way.
  const listFooter = useMemo(() => {
    // Nothing to page through, or nothing but loading placeholders so far.
    if (!handleScrollEnd || !hasFilms) {
      return null;
    }

    // `hasMorePages` knows about the page after this one before it is asked for;
    // without it all the grid can report is the request it has in flight.
    if (!(hasMorePages ?? isLoadingNext)) {
      return null;
    }

    return (
      <View style={ styles.footer }>
        <Loader />
      </View>
    );
  }, [handleScrollEnd, hasFilms, hasMorePages, isLoadingNext, styles]);

  const contentContainerStyle = useMemo(() => {
    const topInset = tabPosition === 'bottom' && !disableStatusbarSafeArea
      ? safeAreaTop
      : 0;

    if (centerEmptyComponent && !data.length) {
      return [
        styles.centeredEmpty,
        topInset > 0 && { paddingTop: topInset },
      ];
    }

    return topInset > 0 ? { paddingTop: topInset } : undefined;
  }, [
    centerEmptyComponent,
    data.length,
    disableStatusbarSafeArea,
    safeAreaTop,
    styles,
    tabPosition,
  ]);

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIsScrolledDown(e.nativeEvent.contentOffset.y > SCROLL_SHOW_THRESHOLD);
  }, []);

  // A tab that lost activity should not keep showing the button once it is
  // no longer tracking scroll -- otherwise a stale 	rue from an earlier
  // visit can surface again before this tab has actually been scrolled.
  useEffect(() => {
    if (!isScrollToTopButtonActive) {
      setIsScrolledDown(false);
    }
  }, [isScrollToTopButtonActive]);

  const handleScrollToTop = useCallback(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  const refreshControl = useMemo(() => (handleRefresh ? (
    <RefreshControl
      refreshing={ isRefreshing }
      onRefresh={ handleRefresh }
    />
  ) : undefined), [isRefreshing, handleRefresh]);

  return (
    <>
      <FlashList
        ref={ listRef }
        data={ data }
        renderItem={ renderItem }
        keyExtractor={ keyExtractor }
        getItemType={ getItemType }
        viewabilityConfig={ viewabilityConfig }
        onViewableItemsChanged={ onViewableItemsChanged }
        onScroll={ isScrollToTopButtonActive ? onScroll : undefined }
        scrollEventThrottle={ isScrollToTopButtonActive ? 100 : undefined }
        onEndReached={ handleScrollEnd }
        onEndReachedThreshold={ 0.75 }
        numColumns={ numberOfColumns }
        overrideItemLayout={ overrideItemLayout }
        ItemSeparatorComponent={ ItemSeparator }
        stickyHeaderIndices={ stickyHeaderIndices.length ? stickyHeaderIndices : undefined }
        ListHeaderComponent={ listHeader }
        ListEmptyComponent={ disableEmptyComponent || hideGrid ? undefined : ListEmptyComponent }
        ListFooterComponent={ listFooter }
        contentContainerStyle={ contentContainerStyle }
        refreshControl={ refreshControl }
        showsVerticalScrollIndicator={ false }
        removeClippedSubviews={ false }
        drawDistance={ 800 }
      />

      { isScrollToTopButtonActive && (
        <Portal>
          <ScrollToTopButton
            visible={ isScrolledDown }
            onPress={ handleScrollToTop }
          />
        </Portal>
      ) }
    </>
  );
}

export default FilmGridComponent;