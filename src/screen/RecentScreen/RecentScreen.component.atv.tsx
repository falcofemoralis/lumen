import { InfoBlock } from 'Component/InfoBlock';
import { Page } from 'Component/Page';
import { ThemedButton } from 'Component/ThemedButton';
import { ThemedGrid } from 'Component/ThemedGrid';
import { ThemedGridRowProps } from 'Component/ThemedGrid/ThemedGrid.type';
import { ThemedImage } from 'Component/ThemedImage';
import { ThemedPressable } from 'Component/ThemedPressable';
import { ThemedText } from 'Component/ThemedText';
import { useLayout } from 'Hooks/useLayout';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import { Trash2 } from 'lucide-react-native';
import { useCallback } from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { DefaultFocus } from 'react-tv-space-navigation';
import { useAppTheme } from 'Theme/context';

import { NUMBER_OF_COLUMNS_TV } from './RecentScreen.config';
import { componentStyles } from './RecentScreen.style.atv';
import { RecentScreenThumbnail } from './RecentScreen.thumbnail.atv';
import { RecentGridItem, RecentScreenComponentProps } from './RecentScreen.type';

export function RecentScreenComponent({
  items,
  isLoading,
  onNextLoad,
  handleOnPress,
  removeItem,
}: RecentScreenComponentProps & { items: RecentGridItem[] }) {
  const { width: containerWidth } = useLayout();
  const { theme } = useAppTheme();
  const styles = useThemedStyles(componentStyles);

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
              <View style={ [styles.posterContainer, isFocused && styles.posterContainerFocused] }>
                <ThemedImage
                  style={ styles.poster }
                  src={ image }
                />
              </View>
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
  }, [handleOnPress, styles]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <RecentScreenThumbnail
          width={ containerWidth }
          styles={ styles }
        />
      );
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
          itemSize={ theme.dimensions.height / 3 }
          renderItem={ renderItem }
          onNextLoad={ onNextLoad }
          scrollBehavior='stick-to-center'
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

export default RecentScreenComponent;
