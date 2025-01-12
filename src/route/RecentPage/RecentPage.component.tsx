import { SCROLL_EVENT_END_PADDING, SCROLL_EVENT_UPDATES_MS } from 'Component/FilmGrid/FilmGrid.config';
import Loader from 'Component/Loader';
import Page from 'Component/Page';
import ThemedButton from 'Component/ThemedButton/ThemedButton.component';
import ThemedImage from 'Component/ThemedImage';
import ThemedText from 'Component/ThemedText';
import React, { memo, useCallback } from 'react';
import {
  FlatList, ListRenderItem, NativeScrollEvent, NativeSyntheticEvent, RefreshControl, View,
} from 'react-native';
import { RecentItemInterface } from 'Type/RecentItem.interface';
import { noopFn } from 'Util/Function';
import { isCloseToBottom } from 'Util/Scroll';

import { styles } from './RecentPage.style';
import { RecentGridRowProps, RecentPageComponentProps } from './RecentPage.type';

function FilmGridRow({
  item,
  handleOnPress,
  index,
}: RecentGridRowProps) {
  const { image, name } = item;

  return (
    <View style={ styles.item }>
      { /* <ThemedText>{ index }</ThemedText> */ }
      <ThemedImage
        style={ styles.poster }
        src={ image }
      />
      <ThemedText>
        { name }
      </ThemedText>
    </View>
  );
}

function rowPropsAreEqual(prevProps: RecentGridRowProps, props: RecentGridRowProps) {
  return prevProps.item.id === props.item.id;
}

const MemoizedGridRow = memo(FilmGridRow, rowPropsAreEqual);

export function RecentPageComponent({
  isSignedIn,
  items,
  handleOnPress,
  onScrollEnd,
  onRefresh = noopFn,
  isRefreshing = false,
}: RecentPageComponentProps) {
  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (isCloseToBottom(event, SCROLL_EVENT_END_PADDING)) {
        onScrollEnd();
      }
    },
    [onScrollEnd],
  );

  const renderRefreshControl = useCallback(() => (
    <RefreshControl
      refreshing={ isRefreshing }
      onRefresh={ onRefresh }
    />
  ), [isRefreshing, onRefresh]);

  const renderRow: ListRenderItem<RecentItemInterface> = useCallback(
    ({ item, index }) => (
      <MemoizedGridRow
        item={ item }
        handleOnPress={ handleOnPress }
        index={ index }
      />
    ),
    [handleOnPress],
  );

  const renderContent = () => {
    if (!isSignedIn) {
      return (
        <View>
          <ThemedText>Sign in</ThemedText>
        </View>
      );
    }

    return (
      <FlatList
        data={ items }
        renderItem={ renderRow }
        keyExtractor={ (item) => `${item.id}-recent-row` }
        onScroll={ onScroll }
        scrollEventThrottle={ SCROLL_EVENT_UPDATES_MS }
        refreshControl={ renderRefreshControl() }
        removeClippedSubviews
      />
    );
  };

  return (
    <Page>
      { renderContent() }
    </Page>
  );
}

export default RecentPageComponent;
