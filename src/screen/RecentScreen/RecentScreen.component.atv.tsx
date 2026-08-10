import { FocusContext, useFocusable } from '@noriginmedia/norigin-spatial-navigation-react-native-tvos';
import { ConfirmOverlay } from 'Component/ConfirmOverlay';
import { InfoBlock } from 'Component/InfoBlock';
import { LoginForm } from 'Component/LoginForm';
import { Page } from 'Component/Page';
import { ThemedButton } from 'Component/ThemedButton';
import { ThemedGrid } from 'Component/ThemedGrid';
import { ThemedGridRowProps } from 'Component/ThemedGrid/ThemedGrid.type';
import { ThemedImage } from 'Component/ThemedImage';
import { ThemedPressable } from 'Component/ThemedPressable';
import { ThemedText } from 'Component/ThemedText';
import { useConfigContext } from 'Context/ConfigContext';
import { useServiceContext } from 'Context/ServiceContext';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import Eye from 'lucide-react-native/icons/eye';
import EyeOff from 'lucide-react-native/icons/eye-off';
import Trash2 from 'lucide-react-native/icons/trash-2';
import { useCallback } from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useAppTheme } from 'Theme/context';
import { ThemedStyles } from 'Theme/types';

import { NUMBER_OF_COLUMNS_TV } from './RecentScreen.config';
import { componentStyles } from './RecentScreen.style.atv';
import { RecentScreenThumbnail } from './RecentScreen.thumbnail.atv';
import { RecentGridItem, RecentScreenComponentProps } from './RecentScreen.type';

type RecentRowProps = {
  item: RecentGridItem;
  styles: ThemedStyles<typeof componentStyles>;
  handleOnPress: (item: RecentGridItem) => void;
  removeItem: (item: RecentGridItem) => void;
  openHideConfirmOverlay: (item: RecentGridItem) => void;
};

// The zoom is applied to the row -- not to the item -- so it also covers the
// gap and grows the row as one block. `hasFocusedChild` keeps it applied while
// focus moves between the item and the two action buttons, and the buttons
// counter-scale so they keep their fixed square size.
function RecentRow({
  item,
  styles,
  handleOnPress,
  removeItem,
  openHideConfirmOverlay,
}: RecentRowProps) {
  const { ref, focusKey, hasFocusedChild } = useFocusable<object, View>({
    trackChildren: true,
    saveLastFocusedChild: false,
  });
  const { scale } = useAppTheme();

  const {
    image,
    name,
    date,
    info,
    additionalInfo,
  } = item;

  return (
    <FocusContext.Provider value={ focusKey }>
      <Animated.View
        ref={ ref }
        style={ [styles.row, hasFocusedChild && styles.rowFocused] }
        tvFocusable={ false }
      >
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
        <ThemedButton
          style={ [styles.actionButton, hasFocusedChild && styles.actionButtonUnzoomed] }
          contentStyle={ styles.actionButtonContent }
          IconComponent={ Trash2 }
          onPress={ () => removeItem(item) }
          iconProps={ {
            size: scale(20),
          } }
        />
        <ThemedButton
          style={ [styles.actionButton, hasFocusedChild && styles.actionButtonUnzoomed] }
          contentStyle={ styles.actionButtonContent }
          IconComponent={ item.isWatched ? EyeOff : Eye }
          onPress={ () => openHideConfirmOverlay(item) }
          iconProps={ {
            size: scale(20),
          } }
        />
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
  const styles = useThemedStyles(componentStyles);
  const { isSignedIn } = useServiceContext();
  const { isLocalLibrary } = useConfigContext();

  const renderItem = useCallback(({ item }: ThemedGridRowProps<RecentGridItem>) => (
    <RecentRow
      item={ item }
      styles={ styles }
      handleOnPress={ handleOnPress }
      removeItem={ removeItem }
      openHideConfirmOverlay={ openHideConfirmOverlay }
    />
  ), [handleOnPress, openHideConfirmOverlay, removeItem, styles]);

  const renderContent = () => {
    if (!isSignedIn && !isLocalLibrary) {
      return <LoginForm autofocus />;
    }

    if (isLoading) {
      return (
        <RecentScreenThumbnail
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
      <ThemedGrid
        autofocus
        style={ styles.grid }
        rowStyle={ styles.rowStyle }
        data={ items }
        numberOfColumns={ NUMBER_OF_COLUMNS_TV }
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
