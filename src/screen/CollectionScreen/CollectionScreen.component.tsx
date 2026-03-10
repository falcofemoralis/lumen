import { InfoBlock } from 'Component/InfoBlock';
import { Page } from 'Component/Page';
import { ThemedGrid } from 'Component/ThemedGrid';
import { ThemedGridRowProps } from 'Component/ThemedGrid/ThemedGrid.type';
import { useGridLayout } from 'Component/ThemedGrid/useGridLayout';
import { ThemedImage } from 'Component/ThemedImage';
import { ThemedPressable } from 'Component/ThemedPressable';
import { ThemedText } from 'Component/ThemedText';
import { Wrapper } from 'Component/Wrapper';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import { memo, useCallback } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from 'Theme/context';
import { ThemedStyles } from 'Theme/types';
import { ContentCollectionInterface } from 'Type/ContentCollection.interface';

import { NUMBER_OF_COLUMNS } from './CollectionScreen.config';
import { componentStyles, ROW_GAP } from './CollectionScreen.style';
import { CollectionScreenThumbnail } from './CollectionScreen.thumbnail';
import { CollectionScreenComponentProps, RecentGridRowProps } from './CollectionScreen.type';

function CollectionItem({
  item,
  index,
  handleOnPress,
  styles,
}: RecentGridRowProps & { styles: ThemedStyles<typeof componentStyles> }) {
  const {
    title,
    image,
    amount,
  } = item;

  return (
    <ThemedPressable
      onPress={ () => handleOnPress(item) }
      style={ [index % 2 === 0 && styles.rowItem] }
      contentStyle={ styles.item }
    >
      <ThemedText style={ styles.amount }>
        { amount }
      </ThemedText>
      <ThemedText style={ styles.text }>
        { title }
      </ThemedText>
      <ThemedImage src={ image } style={ styles.image } />
    </ThemedPressable>
  );
}

function rowPropsAreEqual(prevProps: RecentGridRowProps, props: RecentGridRowProps) {
  return prevProps.item.title === props.item.title;
}

const MemoizedCollectionItem = memo(CollectionItem, rowPropsAreEqual);

export function CollectionScreenComponent({
  items,
  isLoading,
  onNextLoad,
  handleOnPress,
}: CollectionScreenComponentProps) {
  const { scale } = useAppTheme();
  const styles = useThemedStyles(componentStyles);
  const { top } = useSafeAreaInsets();
  const { itemWidth: width } = useGridLayout(NUMBER_OF_COLUMNS, scale(ROW_GAP));

  const renderItem = useCallback(
    ({ item, index }: ThemedGridRowProps<ContentCollectionInterface>) => (
      <MemoizedCollectionItem
        item={ item }
        handleOnPress={ handleOnPress }
        index={ index }
        styles={ styles }
      />
    ),
    [handleOnPress, styles]
  );

  const renderHeader = useCallback(() => {
    return <View style={ { height: top } } />;
  }, [top]);

  const renderEmpty = () => {
    if (isLoading) {
      return <CollectionScreenThumbnail styles={ styles } width={ width } />;
    }

    return (
      <View style={ styles.empty }>
        <InfoBlock
          title={ t('No recent items') }
          subtitle={ t('You have not watched any films yet') }
        />
      </View>
    );
  };

  return (
    <Page>
      <Wrapper>
        <ThemedGrid
          data={ items }
          numberOfColumns={ NUMBER_OF_COLUMNS }
          itemSize={ scale(115) }
          renderItem={ renderItem }
          onNextLoad={ onNextLoad }
          ListHeaderComponent={ renderHeader }
          ListEmptyComponent={ renderEmpty }
        />
      </Wrapper>
    </Page>
  );
}

export default CollectionScreenComponent;
