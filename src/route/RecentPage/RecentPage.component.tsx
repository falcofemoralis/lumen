import { SCROLL_EVENT_END_PADDING, SCROLL_EVENT_UPDATES_MS } from 'Component/FilmGrid/FilmGrid.config';
import Page from 'Component/Page';
import ThemedIcon from 'Component/ThemedIcon';
import { IconPackType } from 'Component/ThemedIcon/ThemedIcon.type';
import ThemedImage from 'Component/ThemedImage';
import ThemedText from 'Component/ThemedText';
import React, { memo, useCallback } from 'react';
import {
  FlatList,
  ListRenderItem,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  RefreshControl,
  TouchableOpacity,
  View,
} from 'react-native';
import { RecentItemInterface } from 'Type/RecentItem.interface';
import { scale } from 'Util/CreateStyles';
import { noopFn } from 'Util/Function';
import { isCloseToBottom } from 'Util/Scroll';

import { styles } from './RecentPage.style';
import { RecentGridRowProps, RecentPageComponentProps } from './RecentPage.type';

function FilmGridRow({
  item,
  handleOnPress,
  index,
  removeItem,
}: RecentGridRowProps) {
  const {
    image,
    name,
    date,
    info,
    additionalInfo,
  } = item;

  return (
    <Pressable onPress={ () => removeItem(item) }>
      <View style={ [styles.item, index !== 0 && styles.itemBorder] }>
        <View style={ styles.itemContainer }>
          <ThemedImage
            style={ styles.poster }
            src={ image }
          />
          <View style={ styles.itemContent }>
            <ThemedText style={ styles.name }>
              { name }
            </ThemedText>
            <ThemedText style={ styles.date }>
              { date }
            </ThemedText>
            { info && (
              <ThemedText style={ styles.info }>
                { info }
              </ThemedText>
            ) }
            { additionalInfo && (
              <ThemedText style={ styles.additionalInfo }>
                { additionalInfo }
              </ThemedText>
            ) }
          </View>
          <TouchableOpacity onPress={ () => handleOnPress(item) }>
            <ThemedIcon
              style={ styles.deleteButton }
              icon={ {
                name: 'delete',
                pack: IconPackType.MaterialCommunityIcons,
              } }
              size={ scale(24) }
              color="white"
            />
          </TouchableOpacity>
        </View>
      </View>
    </Pressable>
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
  removeItem,
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
        removeItem={ removeItem }
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
