import { ConfirmOverlay } from 'Component/ConfirmOverlay';
import { FilmGrid } from 'Component/FilmGrid';
import { FilmList } from 'Component/FilmList';
import { InfoBlock } from 'Component/InfoBlock';
import { LoginForm } from 'Component/LoginForm';
import { Page } from 'Component/Page';
import { useConfigContext } from 'Context/ConfigContext';
import { useServiceContext } from 'Context/ServiceContext';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { ThemedPressable } from 'Component/ThemedPressable';
import { ThemedText } from 'Component/ThemedText';
import Play from 'lucide-react-native/icons/play';
import Trash2 from 'lucide-react-native/icons/trash-2';
import Eye from 'lucide-react-native/icons/eye';
import EyeOff from 'lucide-react-native/icons/eye-off';
import Bell from 'lucide-react-native/icons/bell';
import { ACCOUNT_TAB } from 'Navigation/navigationRoutes';
import { t } from 'i18n/translate';
import { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from 'Theme/context';
import { FilmCardInterface } from 'Type/FilmCard.interface';
import { recentToFilmCard } from 'Util/Film';

import { componentStyles } from './RecentScreen.style';
import { RecentScreenThumbnail } from './RecentScreen.thumbnail';
import { RecentScreenComponentProps } from './RecentScreen.type';

export function RecentScreenComponent({
  displayMode,
  items,
  isLoading,
  hideConfirmOverlayRef,
  removeConfirmOverlayRef,
  onNextLoad,
  handleOnPress,
  handleContinueWatching,
  removeItem,
  openRemoveConfirmOverlay,
  confirmRemoveItem,
  openHideConfirmOverlay,
  hideItem,
  openNotifications,
}: RecentScreenComponentProps) {
  const styles = useThemedStyles(componentStyles);
  const { isSignedIn, badgeData } = useServiceContext();
  const { isLocalLibrary, showRecentNotifications, newHomeInterface } = useConfigContext();

  const filmItems = useMemo(() => (
    items.map(recentToFilmCard)
  ), [items]);

  const listItems = useMemo(() => (
    items.map((item) => ({
      film: recentToFilmCard(item),
      isWatched: item.isWatched,
      additionalInfo: item.additionalInfo,
    }))
  ), [items]);

  const recentItemsById = useMemo(
    () => new Map(items.map((item) => [item.id, item])),
    [items],
  );
  const { scale, theme } = useAppTheme();
  const badge = badgeData[ACCOUNT_TAB] ?? 0;
  const { top } = useSafeAreaInsets();

  const renderFilmActions = useCallback((film: FilmCardInterface) => {
    const item = recentItemsById.get(film.id);

    if (!item) {
      return null;
    }

    const buttonStyle = {
      width: scale(32),
      height: scale(32),
      borderRadius: scale(16),
      backgroundColor: theme.colors.button,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    };

    return (
      <View
        style={ {
          position: 'absolute' as const,
          top: scale(8),
          right: scale(8),
          zIndex: 20,
          gap: scale(6),
        } }
      >
        <ThemedPressable
          onPress={ () => handleContinueWatching(item) }
          style={ buttonStyle }
        >
          <Play
            size={ scale(18) }
            color={ theme.colors.icon }
          />
        </ThemedPressable>

        <ThemedPressable
          onPress={ () => openRemoveConfirmOverlay(item) }
          style={ buttonStyle }
        >
          <Trash2
            size={ scale(18) }
            color={ theme.colors.icon }
          />
        </ThemedPressable>

        <ThemedPressable
          onPress={ () => openHideConfirmOverlay(item) }
          style={ buttonStyle }
        >
          { item.isWatched ? (
            <EyeOff
              size={ scale(18) }
              color={ theme.colors.icon }
            />
          ) : (
            <Eye
              size={ scale(18) }
              color={ theme.colors.icon }
            />
          ) }
        </ThemedPressable>
      </View>
    );
  }, [
    handleContinueWatching,
    openHideConfirmOverlay,
    recentItemsById,
    openRemoveConfirmOverlay,
    removeItem,
    scale,
    theme.colors.button,
    theme.colors.icon,
  ]);

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

  const renderConfirmOverlay = () => (
    <>
      <ConfirmOverlay
        overlayRef={ hideConfirmOverlayRef }
        title={ t('Are you sure?') }
        message={ t('Are you sure you want to hide this item?') }
        onConfirm={ hideItem }
      />
      <ConfirmOverlay
        overlayRef={ removeConfirmOverlayRef }
        title={ t('Are you sure?') }
        message={ t('Are you sure you want to remove this item?') }
        onConfirm={ confirmRemoveItem }
      />
    </>
  );

  const renderContent = () => {
    if (!isSignedIn && !isLocalLibrary) {
      return <LoginForm />;
    }

    if (displayMode === 'list') {
      return (
        <FilmList
          items={ listItems }
          disableStatusbarSafeArea={ newHomeInterface }
          ListEmptyComponent={ renderEmpty }
          onNextLoad={ onNextLoad }
          onFilmPress={ (film) => {
            const item = recentItemsById.get(film.id);

            if (item) {
              handleOnPress(item);
            }
          } }
          onContinueWatching={ (item) => {
            const recentItem = recentItemsById.get(item.film.id);

            if (recentItem) {
              handleContinueWatching(recentItem);
            }
          } }
          onRemove={ (item) => {
            const recentItem = recentItemsById.get(item.film.id);

            if (recentItem) {
              openRemoveConfirmOverlay(recentItem);
            }
          } }
          onToggleWatched={ (item) => {
            const recentItem = recentItemsById.get(item.film.id);

            if (recentItem) {
              openHideConfirmOverlay(recentItem);
            }
          } }
        />
      );
    }

    return (
      <FilmGrid
        films={ filmItems }
        disableStatusbarSafeArea={ newHomeInterface }
        isEmpty={ !items.length }
        ListEmptyComponent={ renderEmpty }
        onNextLoad={ onNextLoad }
        filmActions={ renderFilmActions }
      />
    );
  };

  return (
    <Page>
      { renderConfirmOverlay() }
      { renderContent() }
      { showRecentNotifications && !newHomeInterface && (
        <>
          <ThemedPressable
            style={ [
              styles.recentTopAction,
              { top: top + scale(4) },
            ] }
            contentStyle={ {
              width: '100%',
              height: '100%',
              padding: 0,
              backgroundColor: 'transparent',
            } }
            onPress={ openNotifications }
            disableRipple
          >
            <Bell
              size={ scale(22) }
              color={ theme.colors.icon }
            />
          </ThemedPressable>
          { badge > 0 && (
            <ThemedText
              style={ [
                styles.recentTopBadge,
                { top: top + scale(7) },
              ] }
            >
              { badge }
            </ThemedText>
          ) }
        </>
      ) }
    </Page>
  );
}

export default RecentScreenComponent;
