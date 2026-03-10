import { InfoBlock } from 'Component/InfoBlock';
import { Page } from 'Component/Page';
import { ThemedGrid } from 'Component/ThemedGrid';
import { ThemedGridRowProps } from 'Component/ThemedGrid/ThemedGrid.type';
import { useGridLayout } from 'Component/ThemedGrid/useGridLayout';
import { ThemedImage } from 'Component/ThemedImage';
import { ThemedPressable } from 'Component/ThemedPressable';
import { ThemedText } from 'Component/ThemedText';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { DefaultFocus } from 'react-tv-space-navigation';
import { useAppTheme } from 'Theme/context';
import { ContentCollectionInterface } from 'Type/ContentCollection.interface';

import { NUMBER_OF_COLUMNS_TV } from './CollectionScreen.config';
import { componentStyles, ROW_GAP } from './CollectionScreen.style.atv';
import { CollectionScreenThumbnail } from './CollectionScreen.thumbnail.atv';
import { CollectionScreenComponentProps } from './CollectionScreen.type';

export function CollectionScreenComponent({
  items,
  isLoading,
  onNextLoad,
  handleOnPress,
}: CollectionScreenComponentProps & { items: ContentCollectionInterface[] }) {
  const { scale } = useAppTheme();
  const styles = useThemedStyles(componentStyles);
  const { itemWidth: width } = useGridLayout(NUMBER_OF_COLUMNS_TV, scale(ROW_GAP));
  const height = useMemo(() => (width / (208 / 120)), [width]);

  const renderItem = useCallback(({ item }: ThemedGridRowProps<ContentCollectionInterface>) => {
    const {
      title,
      image,
      amount,
    } = item;

    return (
      <ThemedPressable
        onPress={ () => handleOnPress(item) }
        style={ { height: height + scale(ROW_GAP) } }
      >
        { ({ isFocused }) => {
          return (
            <View
              style={ [
                styles.item,
                { width },
                isFocused && styles.itemFocused,
              ] }
            >
              <ThemedText style={ styles.amount }>
                { amount }
              </ThemedText>
              <ThemedText style={ styles.text }>
                { title }
              </ThemedText>
              <ThemedImage src={ image } style={ styles.image } />
            </View>
          );
        } }
      </ThemedPressable>
    );
  }, [handleOnPress, styles]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <CollectionScreenThumbnail
          styles={ styles }
          width={ width }
          height={ height }
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
          data={ items }
          numberOfColumns={ NUMBER_OF_COLUMNS_TV }
          itemSize={ height + ROW_GAP }
          renderItem={ renderItem }
          onNextLoad={ onNextLoad }
          tvOptimized
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

export default CollectionScreenComponent;
