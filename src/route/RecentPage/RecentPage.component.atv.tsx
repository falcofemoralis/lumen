import InfoBlock from 'Component/InfoBlock';
import Page from 'Component/Page';
import ThemedButton from 'Component/ThemedButton';
import ThemedGrid from 'Component/ThemedGrid';
import { ThemedGridRowProps } from 'Component/ThemedGrid/ThemedGrid.type';
import ThemedImage from 'Component/ThemedImage';
import ThemedPressable from 'Component/ThemedPressable';
import ThemedText from 'Component/ThemedText';
import t from 'i18n/t';
import { Trash2 } from 'lucide-react-native';
import React, { useCallback } from 'react';
import { useWindowDimensions, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { DefaultFocus } from 'react-tv-space-navigation';
import { calculateLayoutWidth } from 'Style/Layout';

import { NUMBER_OF_COLUMNS_TV } from './RecentPage.config';
import { styles } from './RecentPage.style.atv';
import { RecentPageThumbnail } from './RecentPage.thumbnail.atv';
import { RecentGridItem, RecentPageComponentProps } from './RecentPage.type';

export function RecentPageComponent({
  items,
  isLoading,
  onNextLoad,
  handleOnPress,
  removeItem,
}: RecentPageComponentProps & { items: RecentGridItem[] }) {
  const containerWidth = calculateLayoutWidth();
  const { height } = useWindowDimensions();

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
      isDeleteButton,
    } = item;

    const width = containerWidth / 2;

    if (isDeleteButton) {
      return (
        <ThemedButton
          style={ styles.deleteButton }
          IconComponent={ Trash2 }
          onPress={ () => removeItem(item) }
          withAnimation
        />
      );
    }

    return (
      <ThemedPressable
        onPress={ () => handleOnPress(item) }
      >
        { ({ isFocused }) => {
          return (
            <Animated.View
              style={ [
                styles.item,
                { width },
                isFocused && styles.itemFocused,
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
      </ThemedPressable>
    );
  }, [handleOnPress]);

  const renderContent = () => {
    if (isLoading) {
      return <RecentPageThumbnail />;
    }

    if (!items.length) {
      return (
        <View style={ styles.empty }>
          <InfoBlock
            title={ t('No recent items') }
            subtitle={ t('You have not watched any films yet') }
          />
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
    <Page contentStyle={ styles.page }>
      { renderContent() }
    </Page>
  );
}

export default RecentPageComponent;
