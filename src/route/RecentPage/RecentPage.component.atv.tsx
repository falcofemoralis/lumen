import Page from 'Component/Page';
import ThemedButton from 'Component/ThemedButton';
import { IconPackType } from 'Component/ThemedIcon/ThemedIcon.type';
import ThemedImage from 'Component/ThemedImage';
import ThemedList from 'Component/ThemedList';
import { ThemedListRowProps } from 'Component/ThemedList/ThemedList.type';
import ThemedText from 'Component/ThemedText';
import Thumbnail from 'Component/Thumbnail';
import React, { useCallback } from 'react';
import { Animated, Dimensions, View } from 'react-native';
import { DefaultFocus, SpatialNavigationFocusableView } from 'react-tv-space-navigation';
import { scale } from 'Util/CreateStyles';
import { getWindowWidth } from 'Util/Window';

import { NUMBER_OF_COLUMNS_TV } from './RecentPage.config';
import { ROW_GAP, styles } from './RecentPage.style.atv';
import { RecentGridItem, RecentPageComponentProps } from './RecentPage.type';
import { useFocusAnimation } from './useFocusAnimation';

export function RecentPageComponent({
  isSignedIn,
  items,
  onNextLoad,
  handleOnPress,
  removeItem,
}: RecentPageComponentProps & { items: RecentGridItem[] }) {
  const containerWidth = getWindowWidth() - scale(ROW_GAP * 2);
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

  const renderItem = useCallback(({ item }: ThemedListRowProps<RecentGridItem>) => {
    const {
      image,
      name,
      date,
      info,
      additionalInfo,
      isThumbnail,
      isDeleteButton,
    } = item;

    // containerWidth / NUMBER_OF_COLUMNS_TV - scale(ROW_GAP)
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
        <ThemedList
          data={ prepareItems() }
          renderItem={ renderItem }
          itemHeight={ height / 3 }
          numberOfColumns={ NUMBER_OF_COLUMNS_TV + 1 }
          style={ styles.grid }
          rowStyle={ styles.rowStyle }
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
