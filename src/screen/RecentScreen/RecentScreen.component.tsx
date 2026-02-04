import { InfoBlock } from 'Component/InfoBlock';
import { Page } from 'Component/Page';
import { ThemedGrid } from 'Component/ThemedGrid';
import { ThemedGridRowProps } from 'Component/ThemedGrid/ThemedGrid.type';
import { ThemedImage } from 'Component/ThemedImage';
import { ThemedPressable } from 'Component/ThemedPressable';
import { ThemedText } from 'Component/ThemedText';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import { Trash2 } from 'lucide-react-native';
import { memo, useCallback } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from 'Theme/context';
import { RecentItemInterface } from 'Type/RecentItem.interface';

import { NUMBER_OF_COLUMNS } from './RecentScreen.config';
import { componentStyles } from './RecentScreen.style';
import { RecentScreenThumbnail } from './RecentScreen.thumbnail';
import { RecentGridRowProps, RecentScreenComponentProps } from './RecentScreen.type';

function RecentItem({
  item,
  index,
  handleOnPress,
  removeItem,
  styles,
}: RecentGridRowProps) {
  const {
    image,
    name,
    date,
    info,
    additionalInfo,
  } = item;
  const { scale, theme } = useAppTheme();

  return (
    <ThemedPressable
      onPress={ () => handleOnPress(item) }
      contentStyle={ styles.itemContentWrapper }
    >
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
          <ThemedPressable
            onPress={ () => removeItem(item) }
            style={ styles.deleteButton }
          >
            <Trash2
              size={ scale(24) }
              color={ theme.colors.icon }
            />
          </ThemedPressable>
        </View>
      </View>
    </ThemedPressable>
  );
}

function rowPropsAreEqual(prevProps: RecentGridRowProps, props: RecentGridRowProps) {
  return prevProps.item.id === props.item.id;
}

const MemoizedRecentItem = memo(RecentItem, rowPropsAreEqual);

export function RecentScreenComponent({
  items,
  isLoading,
  onNextLoad,
  handleOnPress,
  removeItem,
}: RecentScreenComponentProps) {
  const { scale } = useAppTheme();
  const styles = useThemedStyles(componentStyles);
  const { top } = useSafeAreaInsets();

  const renderItem = useCallback(
    ({ item, index }: ThemedGridRowProps<RecentItemInterface>) => (
      <MemoizedRecentItem
        item={ item }
        handleOnPress={ handleOnPress }
        index={ index }
        removeItem={ removeItem }
        styles={ styles }
      />
    ),
    [handleOnPress, styles]
  );

  const renderContent = () => {
    if (isLoading) {
      return <RecentScreenThumbnail top={ top } styles={ styles } />;
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
      <ThemedGrid
        data={ items }
        numberOfColumns={ NUMBER_OF_COLUMNS }
        itemSize={ scale(130) }
        renderItem={ renderItem }
        onNextLoad={ onNextLoad }
        ListHeaderComponent={ <View style={ { height: top } } /> }
      />
    );
  };

  return (
    <Page>
      { renderContent() }
    </Page>
  );
}

export default RecentScreenComponent;
