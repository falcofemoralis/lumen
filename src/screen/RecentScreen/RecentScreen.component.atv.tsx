import { FocusContext, useFocusable } from '@noriginmedia/norigin-spatial-navigation-react-native-tvos';
import { ConfirmOverlay } from 'Component/ConfirmOverlay';
import { InfoBlock } from 'Component/InfoBlock';
import { LoginForm } from 'Component/LoginForm';
import { Page } from 'Component/Page';
import { ThemedButton } from 'Component/ThemedButton';
import { ThemedGrid } from 'Component/ThemedGrid';
import { ThemedGridRowProps } from 'Component/ThemedGrid/ThemedGrid.type';
import { ThemedImage } from 'Component/ThemedImage';
import { ThemedOverlay } from 'Component/ThemedOverlay';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { ThemedPressable } from 'Component/ThemedPressable';
import { ThemedSimpleList } from 'Component/ThemedSimpleList';
import { ListItem } from 'Component/ThemedSimpleList/ThemedSimpleList.type';
import { ThemedText } from 'Component/ThemedText';
import { useConfigContext } from 'Context/ConfigContext';
import { useServiceContext } from 'Context/ServiceContext';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import EllipsisVertical from 'lucide-react-native/icons/ellipsis-vertical';
import Eye from 'lucide-react-native/icons/eye';
import EyeOff from 'lucide-react-native/icons/eye-off';
import Trash2 from 'lucide-react-native/icons/trash-2';
import { useCallback, useRef } from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useAppTheme } from 'Theme/context';
import { ThemedStyles } from 'Theme/types';

import {
  ITEMS_ON_SCREEN_TV,
  NUMBER_OF_COLUMNS_TV,
  NUMBER_OF_COLUMNS_TV_TWO_COLUMNS,
} from './RecentScreen.config';
import { componentStyles, componentStylesTwoColumns } from './RecentScreen.style.atv';
import { RecentScreenThumbnail } from './RecentScreen.thumbnail.atv';
import { RecentGridItem, RecentScreenComponentProps } from './RecentScreen.type';

const ACTION_REMOVE = 'remove';
const ACTION_HIDE = 'hide';

const NAME_MAX_LINES = 2;
const INFO_MAX_LINES = 2;
const ACTION_ICON_SIZE = 20;

type RecentRowProps = {
  item: RecentGridItem;
  styles: ThemedStyles<typeof componentStyles>;
  // Two-column cells are half as wide, and a row of buttons costs width the
  // title needs -- so there the actions collapse into one button opening a menu.
  // A full-width row has the room to keep them all out in the open.
  compactActions: boolean;
  isLastRow: boolean;
  handleOnPress: (item: RecentGridItem) => void;
  removeItem: (item: RecentGridItem) => void;
  openHideConfirmOverlay: (item: RecentGridItem) => void;
};

// The zoom is applied to the row -- not to the item -- so it also covers the
// gap and grows the row as one block. `hasFocusedChild` keeps it applied while
// focus moves between the item and the action buttons, and the buttons
// counter-scale so they keep their fixed square size.
function RecentRow({
  item,
  styles,
  compactActions,
  isLastRow,
  handleOnPress,
  removeItem,
  openHideConfirmOverlay,
}: RecentRowProps) {
  const { ref, focusKey, hasFocusedChild } = useFocusable<object, View>({
    trackChildren: true,
    saveLastFocusedChild: false,
  });
  const { scale } = useAppTheme();
  const actionsOverlayRef = useRef<ThemedOverlayRef>(null);

  const {
    image,
    name,
    date,
    info,
    additionalInfo,
    isWatched,
  } = item;

  const handleAction = useCallback((action: ListItem) => {
    actionsOverlayRef.current?.close();

    if (action.value === ACTION_REMOVE) {
      removeItem(item);

      return;
    }

    // Either toggles a watched item back on the spot or opens the screen's
    // confirmation -- which is a second overlay, so this one has to be closing
    // already for focus to hand over to it.
    openHideConfirmOverlay(item);
  }, [item, removeItem, openHideConfirmOverlay]);

  const renderActionsOverlay = () => {
    if (!compactActions) {
      return null;
    }

    return (
      <ThemedOverlay ref={ actionsOverlayRef }>
        <View style={ styles.overlayActions }>
          <ThemedSimpleList
            data={ [
              {
                label: t('Remove'),
                value: ACTION_REMOVE,
              },
              {
                label: isWatched ? t('Show') : t('Hide'),
                value: ACTION_HIDE,
              },
            ] }
            onChange={ handleAction }
          />
        </View>
      </ThemedOverlay>
    );
  };

  const renderActions = () => {
    if (compactActions) {
      return (
        <ThemedButton
          style={ [styles.actionButton, hasFocusedChild && styles.actionButtonUnzoomed] }
          contentStyle={ styles.actionButtonContent }
          IconComponent={ EllipsisVertical }
          onPress={ () => actionsOverlayRef.current?.open() }
          iconProps={ {
            size: scale(ACTION_ICON_SIZE),
          } }
        />
      );
    }

    return (
      <>
        <ThemedButton
          style={ [styles.actionButton, hasFocusedChild && styles.actionButtonUnzoomed] }
          contentStyle={ styles.actionButtonContent }
          IconComponent={ Trash2 }
          onPress={ () => removeItem(item) }
          iconProps={ {
            size: scale(ACTION_ICON_SIZE),
          } }
        />
        <ThemedButton
          style={ [styles.actionButton, hasFocusedChild && styles.actionButtonUnzoomed] }
          contentStyle={ styles.actionButtonContent }
          IconComponent={ isWatched ? EyeOff : Eye }
          onPress={ () => openHideConfirmOverlay(item) }
          iconProps={ {
            size: scale(ACTION_ICON_SIZE),
          } }
        />
      </>
    );
  };

  return (
    <FocusContext.Provider value={ focusKey }>
      <Animated.View
        ref={ ref }
        style={ [styles.row, isLastRow && styles.lastRow, hasFocusedChild && styles.rowFocused] }
        tvFocusable={ false }
      >
        { renderActionsOverlay() }
        <ThemedPressable
          style={ styles.fill }
          contentStyle={ styles.fill }
          onPress={ () => handleOnPress(item) }
        >
          { ({ isFocused }) => {
            return (
              <Animated.View
                style={ [
                  styles.fill,
                  styles.item,
                  isFocused && styles.itemFocused,
                  item.isWatched && styles.itemHidden,
                ] }
              >
                <View style={ [styles.poster, styles.posterContainer, isFocused && styles.posterContainerFocused] }>
                  <ThemedImage
                    style={ styles.poster }
                    src={ image }
                  />
                </View>
                { /* The row is a fixed height and its content is centred, so
                     text that wraps past it is clipped at both ends rather than
                     pushing the row taller -- every line count is capped. Long
                     titles are the common case; two lines then an ellipsis. */ }
                <View style={ styles.itemContent }>
                  <ThemedText
                    style={ [styles.name, isFocused && styles.nameFocused] }
                    numberOfLines={ NAME_MAX_LINES }
                  >
                    { name }
                  </ThemedText>
                  <ThemedText
                    style={ [styles.date, isFocused && styles.dateFocused] }
                    numberOfLines={ 1 }
                  >
                    { date }
                  </ThemedText>
                  { info && (
                    <ThemedText
                      style={ [styles.info, isFocused && styles.infoFocused] }
                      numberOfLines={ INFO_MAX_LINES }
                    >
                      { info }
                    </ThemedText>
                  ) }
                  { additionalInfo && (
                    <ThemedText
                      style={ [styles.additionalInfo, isFocused && styles.additionalInfoFocused] }
                      numberOfLines={ INFO_MAX_LINES }
                    >
                      { additionalInfo }
                    </ThemedText>
                  ) }
                </View>
              </Animated.View>
            );
          } }
        </ThemedPressable>
        { renderActions() }
      </Animated.View>
    </FocusContext.Provider>
  );
}

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
  const { isSignedIn } = useServiceContext();
  const { isLocalLibrary, recentTwoColumnsTV } = useConfigContext();

  const numberOfColumns = recentTwoColumnsTV ? NUMBER_OF_COLUMNS_TV_TWO_COLUMNS : NUMBER_OF_COLUMNS_TV;
  const styles = useThemedStyles(recentTwoColumnsTV ? componentStylesTwoColumns : componentStyles);

  // Start of the last -- possibly partly filled -- row: every cell of that row
  // has to reserve the room the focus zoom bleeds past the end of the list.
  const lastRowStart = Math.floor(Math.max(items.length - 1, 0) / numberOfColumns) * numberOfColumns;

  const renderItem = useCallback(({ item, index }: ThemedGridRowProps<RecentGridItem>) => (
    <RecentRow
      item={ item }
      styles={ styles }
      compactActions={ recentTwoColumnsTV }
      isLastRow={ index >= lastRowStart }
      handleOnPress={ handleOnPress }
      removeItem={ removeItem }
      openHideConfirmOverlay={ openHideConfirmOverlay }
    />
  ), [handleOnPress, openHideConfirmOverlay, removeItem, styles, recentTwoColumnsTV, lastRowStart]);

  const renderContent = () => {
    if (!isSignedIn && !isLocalLibrary) {
      return <LoginForm autofocus />;
    }

    if (isLoading) {
      return (
        <RecentScreenThumbnail
          styles={ styles }
          thumbnailsAmount={ ITEMS_ON_SCREEN_TV * numberOfColumns }
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
      <ThemedGrid
        // FlashList measures its cells off the column count, so a fresh list is
        // cheaper -- and safer -- than making it re-measure when the setting flips
        // while the screen stays mounted.
        key={ numberOfColumns }
        autofocus
        style={ styles.grid }
        rowStyle={ styles.rowStyle }
        data={ items }
        numberOfColumns={ numberOfColumns }
        renderItem={ renderItem }
        onNextLoad={ onNextLoad }
        scrollBehavior='stick-to-center'
      />
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
      { renderContent() }
    </Page>
  );
}

export default RecentScreenComponent;
