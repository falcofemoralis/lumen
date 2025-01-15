import { SCROLL_EVENT_UPDATES_MS_TV } from 'Component/FilmGrid/FilmGrid.config';
import Page from 'Component/Page';
import ThemedImage from 'Component/ThemedImage';
import ThemedText from 'Component/ThemedText';
import React, { useCallback } from 'react';
import { Animated, Dimensions, View } from 'react-native';
import { SpatialNavigationFocusableView, SpatialNavigationVirtualizedGrid } from 'react-tv-space-navigation';
import { scale } from 'Util/CreateStyles';
import { getWindowWidth } from 'Util/Window';

import { NUMBER_OF_COLUMNS_TV } from './RecentPage.config';
import { ROW_GAP, styles } from './RecentPage.style.atv';
import { RecentGridItem, RecentPageComponentProps } from './RecentPage.type';
import { useFocusAnimation } from './useFocusAnimation';

export function RecentPageComponent({
  isSignedIn,
  items,
  onScrollEnd,
  handleOnPress,
}: RecentPageComponentProps) {
  const containerWidth = getWindowWidth() - scale(ROW_GAP * 2);

  const renderItem = useCallback(({ item }: { item: RecentGridItem }) => {
    const {
      image,
      name,
      date,
      info,
      additionalInfo,
    } = item;

    return (
      <SpatialNavigationFocusableView
        onSelect={ () => handleOnPress(item) }
        onLongSelect={ () => console.log('remove') }
      >
        { ({ isFocused }) => {
          const scaleAnimation = useFocusAnimation(isFocused);

          return (
            <Animated.View
              style={ [
                styles.item,
                { width: containerWidth / NUMBER_OF_COLUMNS_TV - scale(ROW_GAP) },
                isFocused && styles.itemFocused,
                scaleAnimation,
              ] }
            >
              <ThemedImage
                style={ styles.poster }
                src={ image }
              />
              <View style={ styles.itemContent }>
                <ThemedText style={ [styles.name, isFocused && styles.nameFocused] }>
                  { name }
                </ThemedText>
                <ThemedText style={ [styles.date, isFocused && styles.dateFocused] }>
                  { date }
                </ThemedText>
                { info && (
                  <ThemedText style={ [styles.info, isFocused && styles.infoFocused] }>
                    { info }
                  </ThemedText>
                ) }
                { additionalInfo && (
                  <ThemedText
                    style={ [styles.additionalInfo, isFocused && styles.additionalInfoFocused] }
                  >
                    { additionalInfo }
                  </ThemedText>
                ) }
              </View>
            </Animated.View>
          );
        } }
      </SpatialNavigationFocusableView>
    );
  }, [handleOnPress]);

  const { height } = Dimensions.get('window');

  const renderContent = () => {
    if (!isSignedIn) {
      return (
        <View>
          <ThemedText>Sign in</ThemedText>
        </View>
      );
    }

    return (
      <SpatialNavigationVirtualizedGrid
        data={ items }
        renderItem={ renderItem }
        itemHeight={ height / 3 }
        numberOfColumns={ 2 }
        scrollInterval={ SCROLL_EVENT_UPDATES_MS_TV }
        onEndReached={ onScrollEnd }
        onEndReachedThresholdRowsNumber={ 2 }
        style={ styles.grid }
        rowContainerStyle={ styles.rowStyle }
        // style={ styles.container }
        // additionalRenderedRows={ 1 }
        // scrollDuration={ 500 }
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
