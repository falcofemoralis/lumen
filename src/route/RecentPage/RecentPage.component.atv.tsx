import Page from 'Component/Page';
import ThemedButton from 'Component/ThemedButton';
import ThemedGrid from 'Component/ThemedGrid';
import { ThemedGridRowProps } from 'Component/ThemedGrid/ThemedGrid.type';
import { IconPackType } from 'Component/ThemedIcon/ThemedIcon.type';
import ThemedImage from 'Component/ThemedImage';
import ThemedText from 'Component/ThemedText';
import Thumbnail from 'Component/Thumbnail';
import React, { useCallback } from 'react';
import { Animated, Dimensions, View } from 'react-native';
import { DefaultFocus, SpatialNavigationFocusableView } from 'react-tv-space-navigation';
import { calculateLayoutWidth } from 'Style/Layout';
import { scale } from 'Util/CreateStyles';

import { NUMBER_OF_COLUMNS_TV } from './RecentPage.config';
import { styles } from './RecentPage.style.atv';
import { RecentGridItem, RecentPageComponentProps } from './RecentPage.type';
import { useFocusAnimation } from './useFocusAnimation';

export function RecentPageComponent({
  isSignedIn,
  items,
  onNextLoad,
  handleOnPress,
  removeItem,
}: RecentPageComponentProps & { items: RecentGridItem[] }) {
  const containerWidth = calculateLayoutWidth();
  const { height } = Dimensions.get('window');

  const prepareItems = () => {
    const rowsItems = [] as RecentGridItem[];

    items.forEach((item) => {
      rowsItems.push(item);
      rowsItems.push({
        ...item,
        isDeleteButton: true,
      });
    });

    return rowsItems;
  };

  const renderItem = useCallback(({ item }: ThemedGridRowProps<RecentGridItem>) => {
    const {
      image,
      name,
      date,
      info,
      additionalInfo,
      isThumbnail,
      isDeleteButton,
    } = item;

    const width = containerWidth / 2;

    if (isThumbnail && isDeleteButton) {
      return <View />;
    }

    if (isThumbnail) {
      return (
        <View style={ [
          styles.item,
          { width },
        ] }
        >
          <Thumbnail
            style={ styles.poster }
          />
          <View style={ styles.itemContent }>
            <Thumbnail
              height={ scale(30) }
              width="60%"
            />
            <Thumbnail
              height={ scale(20) }
              width="10%"
            />
            <Thumbnail
              height={ scale(20) }
              width="30%"
            />
          </View>
        </View>
      );
    }

    if (isDeleteButton) {
      return (
        <ThemedButton
          style={ styles.deleteButton }
          icon={ {
            pack: IconPackType.MaterialCommunityIcons,
            name: 'delete',
          } }
          onPress={ () => removeItem(item) }
        />
      );
    }

    return (
      <SpatialNavigationFocusableView onSelect={ () => handleOnPress(item) }>
        { ({ isFocused }) => {
          const scaleAnimation = useFocusAnimation(isFocused);

          return (
            <Animated.View
              style={ [
                styles.item,
                { width },
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

  const renderContent = () => {
    if (!isSignedIn) {
      return (
        <View>
          <ThemedText>Sign in</ThemedText>
        </View>
      );
    }

    return (
      <DefaultFocus>
        <ThemedGrid
          style={ styles.grid }
          rowStyle={ styles.rowStyle }
          data={ prepareItems() }
          numberOfColumns={ NUMBER_OF_COLUMNS_TV + 1 }
          itemSize={ height / 3 }
          renderItem={ renderItem }
          onNextLoad={ onNextLoad }
        />
      </DefaultFocus>
    );
  };

  return (
    <Page>
      { renderContent() }
    </Page>
  );
}

export default RecentPageComponent;
