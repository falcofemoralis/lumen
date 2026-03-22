import { ConfirmOverlay } from 'Component/ConfirmOverlay';
import { InfoBlock } from 'Component/InfoBlock';
import { Page } from 'Component/Page';
import { ThemedGrid } from 'Component/ThemedGrid';
import { ThemedGridRowProps } from 'Component/ThemedGrid/ThemedGrid.type';
import { ThemedImage } from 'Component/ThemedImage';
import { ThemedPressable } from 'Component/ThemedPressable';
import { ThemedText } from 'Component/ThemedText';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import { Eye, EyeOff, Trash2 } from 'lucide-react-native';
import { memo, useCallback } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from 'Theme/context';
import { ThemedStyles } from 'Theme/types';
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
  openHideConfirmOverlay,
}: RecentGridRowProps & { styles: ThemedStyles<typeof componentStyles> }) {
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
      <View style={ [
        styles.item,
        index !== 0 && styles.itemBorder,
        item.isWatched && styles.itemHidden,
      ] }
      >
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
          <View style={ styles.actionsColumn }>
            <ThemedPressable
              onPress={ () => removeItem(item) }
              style={ styles.deleteButton }
            >
              <Trash2
                size={ scale(24) }
                color={ theme.colors.icon }
              />
            </ThemedPressable>
            <ThemedPressable
              onPress={ () => openHideConfirmOverlay(item) }
              style={ styles.deleteButton }
            >
              { item.isWatched ? (
                <EyeOff
                  size={ scale(24) }
                  color={ theme.colors.icon }
                />
              ) : (
                <Eye
                  size={ scale(24) }
                  color={ theme.colors.icon }
                />
              ) }
            </ThemedPressable>
          </View>
        </View>
      </View>
    </ThemedPressable>
  );
}

function rowPropsAreEqual(prevProps: RecentGridRowProps, props: RecentGridRowProps) {
  return prevProps.item.id === props.item.id && prevProps.item.isWatched === props.item.isWatched;
}

const MemoizedRecentItem = memo(RecentItem, rowPropsAreEqual);

export function RecentScreenComponent({
  items,
  isLoading,
  hideConfirmOverlayRef,
  onNextLoad,
  handleOnPress,
  removeItem,
  openHideConfirmOverlay,
  hideItem,
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
        openHideConfirmOverlay={ openHideConfirmOverlay }
      />
    ),
    [handleOnPress, styles]
  );

  const renderHeader = useCallback(() => {
    return <View style={ { height: top } } />;
  }, [top]);

  const renderEmpty = () => {
    if (isLoading) {
      return <RecentScreenThumbnail styles={ styles } />;
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

  const renderConfirmOverlay = () => {
    return (
      <ConfirmOverlay
        overlayRef={ hideConfirmOverlayRef }
        title={ t('Are you sure?') }
        message={ t('Are you sure you want to hide this item?') }
        onConfirm={ hideItem }
      />
    );
  };

  return (
    <Page>
      { renderConfirmOverlay() }
      <ThemedGrid
        data={ items }
        numberOfColumns={ NUMBER_OF_COLUMNS }
        renderItem={ renderItem }
        onNextLoad={ onNextLoad }
        ListHeaderComponent={ renderHeader }
        ListEmptyComponent={ renderEmpty }
      />
    </Page>
  );
}

export default RecentScreenComponent;
