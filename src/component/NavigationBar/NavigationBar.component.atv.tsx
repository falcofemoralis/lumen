import { FocusContext, useFocusable } from '@noriginmedia/norigin-spatial-navigation-react-native-tvos';
import { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { NavigationRoute, ParamListBase } from '@react-navigation/native';
import { ThemedImage } from 'Component/ThemedImage';
import { ThemedPressable } from 'Component/ThemedPressable';
import { ThemedScrollView } from 'Component/ThemedScrollView';
import { ThemedText } from 'Component/ThemedText';
import { useNavigationContext } from 'Context/NavigationContext';
import { useServiceContext } from 'Context/ServiceContext';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import { ACCOUNT_TAB, SETTINGS_SCREEN } from 'Navigation/navigationRoutes';
import { ComponentType, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Image, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useAppTheme } from 'Theme/context';
import { ThemedStyles } from 'Theme/types';
import { ProfileInterface } from 'Type/Profile.interface';
import { setTimeoutSafe } from 'Util/Misc';

import { componentStyles } from './NavigationBar.style.atv';
import { NavigationBarComponentProps } from './NavigationBar.type';

export const SIDEBAR_FOCUS_KEY = 'SIDEBAR';

const TAB_SELECT_DEBOUNCE_MS = 500;

const getTabFocusKey = (name: string) => `sidebar-tab-${name}`;

type TabBarLabel = BottomTabNavigationOptions['tabBarLabel'];

type NavigationTabProps = {
  styles: ThemedStyles<typeof componentStyles>,
  name: string,
  label?: TabBarLabel,
  IconComponent?: ComponentType<any>,
  badgeCount: number,
  profile?: ProfileInterface | null,
  isActiveTab: boolean,
  isMenuOpened: boolean,
  onTabSelect: (name: string) => void,
  onTabFocus: (name: string) => void,
  onReload: () => void,
};

const NavigationTab = ({
  styles,
  name,
  label,
  IconComponent,
  badgeCount,
  profile,
  isActiveTab,
  isMenuOpened,
  onTabSelect,
  onTabFocus,
  onReload,
}: NavigationTabProps) => {
  const { theme } = useAppTheme();
  const { isSignedIn } = useServiceContext();

  const renderLabel = (isFocused: boolean) => {
    if (typeof label === 'function') {
      return label({
        focused: isActiveTab,
        color: isFocused && isMenuOpened ? theme.colors.iconFocused : theme.colors.icon,
        position: 'below-icon',
        children: '',
      });
    }

    return label;
  };

  const renderDefaultTab = (isFocused: boolean) => (
    <>
      <View>
        { IconComponent && (
          <IconComponent
            style={ styles.tabIcon }
            size={ styles.tabIcon.width }
            color={ isFocused && isMenuOpened ? theme.colors.iconFocused : theme.colors.icon }
          />
        ) }
        { badgeCount > 0 && (
          <ThemedText style={ styles.badge }>
            { badgeCount }
          </ThemedText>
        ) }
      </View>
      <ThemedText
        style={ [
          styles.tabText,
          isFocused && isMenuOpened && styles.tabContentFocused,
        ] }
      >
        { renderLabel(isFocused) }
      </ThemedText>
    </>
  );

  const renderAccountTab = (isFocused: boolean) => {
    const { avatar } = profile ?? {};

    return (
      <>
        <View style={ styles.profileAvatarContainer }>
          { avatar ? (
            <ThemedImage
              src={ avatar }
              style={ styles.profileAvatar }
            />
          ) : (
            <Image
              source={ require('../../../assets/images/no_avatar.png') }
              style={ styles.profileAvatar }
            />
          ) }
        </View>
        <View style={ styles.profile }>
          <ThemedText
            style={ [
              styles.tabText,
              styles.profileNameText,
              isFocused && isMenuOpened && styles.tabContentFocused,
            ] }
          >
            { renderLabel(isFocused) }
          </ThemedText>
          <ThemedText
            style={ [
              styles.tabText,
              styles.profileSwitchText,
              isFocused && isMenuOpened && styles.tabContentFocused,
            ] }
          >
            { isSignedIn ? t('You') : t('Sign in') }
          </ThemedText>
        </View>
      </>
    );
  };

  return (
    <ThemedPressable
      focusKey={ getTabFocusKey(name) }
      onFocus={ () => onTabFocus(name) }
      onEnterPress={ onReload }
      onPress={ () => onTabSelect(name) }
      style={ styles.tabButton }
      contentStyle={ styles.tabButtonContent }
    >
      { ({ isFocused }) => (
        <View
          style={ [
            styles.tab,
            isActiveTab && !isMenuOpened && styles.tabSelected,
            isFocused && isMenuOpened && styles.tabFocused,
          ] }
        >
          { name === ACCOUNT_TAB ? renderAccountTab(isFocused) : renderDefaultTab(isFocused) }
        </View>
      ) }
    </ThemedPressable>
  );
};

const MemoizedNavigationTab = memo(NavigationTab);

export function NavigationBarComponent({
  state,
  descriptors,
  profile,
  onPress,
  onReload,
}: NavigationBarComponentProps) {
  const { badgeData } = useServiceContext();
  const { toggleMenu, hideScene } = useNavigationContext();
  const styles = useThemedStyles(componentStyles);
  const timerRef = useRef<number | null>(null);
  const pendingTabRef = useRef<string | null>(null);
  const hasFocusedChildRef = useRef(false);
  const [focusedTabName, setFocusedTabName] = useState<string | null>(null);

  const activeTabName = state.routes[state.index]?.name ?? null;

  const { ref, focusKey, hasFocusedChild } = useFocusable({
    focusKey: SIDEBAR_FOCUS_KEY,
    trackChildren: true,
    isFocusBoundary: true,
    focusBoundaryDirections: ['left'],
    saveLastFocusedChild: false,
    preferredChildFocusKey: activeTabName ? getTabFocusKey(activeTabName) : undefined,
  });

  useEffect(() => {
    hasFocusedChildRef.current = hasFocusedChild;
    toggleMenu(hasFocusedChild);

    // the user left the sidebar before the debounce elapsed — commit the tab now,
    // so navigation never lands while focus already sits inside the content
    if (!hasFocusedChild && timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;

      if (pendingTabRef.current) {
        onPress(pendingTabRef.current);
        pendingTabRef.current = null;
      }
    }
  }, [hasFocusedChild, toggleMenu, onPress]);

  // mask the scene only while a *different* tab is being previewed — browsing back
  // onto the tab you are already on should reveal it again, not hide it
  useEffect(() => {
    hideScene(
      hasFocusedChild
      && focusedTabName !== null
      && focusedTabName !== activeTabName
    );
  }, [hasFocusedChild, focusedTabName, activeTabName, hideScene]);

  useEffect(() => () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, []);

  const onTabSelect = useCallback((name: string) => {
    setFocusedTabName(name);

    onPress(name);
  }, [onPress]);

  const onTabFocus = useCallback((name: string) => {
    if (!hasFocusedChildRef.current) {
      return;
    }

    setFocusedTabName(name);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    pendingTabRef.current = name;
    timerRef.current = setTimeoutSafe(() => {
      timerRef.current = null;
      pendingTabRef.current = null;
      onTabSelect(name);
    }, TAB_SELECT_DEBOUNCE_MS);
  }, [onTabSelect]);

  const { topTabs, middleTabs, bottomTabs } = useMemo(() => {
    const tt = [] as { route: NavigationRoute<ParamListBase, string>, index: number }[];
    const mt = [] as { route: NavigationRoute<ParamListBase, string>, index: number }[];
    const bt = [] as { route: NavigationRoute<ParamListBase, string>, index: number }[];

    state.routes.forEach((route, index) => {
      switch (route.name) {
        case ACCOUNT_TAB:
          tt.push({ route, index });
          break;
        case SETTINGS_SCREEN:
          bt.push({ route, index });
          break;
        default:
          mt.push({ route, index });
          break;
      }
    });

    return { topTabs: tt, middleTabs: mt, bottomTabs: bt };
  }, [state.routes]);

  const renderTab = (
    route: NavigationRoute<ParamListBase, string>,
    index: number
  ) => {
    const { options } = descriptors[route.key] ?? {};

    return (
      <MemoizedNavigationTab
        key={ route.name }
        styles={ styles }
        name={ route.name }
        label={ options?.tabBarLabel }
        IconComponent={ options?.tabBarIcon }
        badgeCount={ badgeData[route.name] || 0 }
        profile={ route.name === ACCOUNT_TAB ? profile : undefined }
        isActiveTab={ state.index === index }
        isMenuOpened={ hasFocusedChild }
        onTabSelect={ onTabSelect }
        onTabFocus={ onTabFocus }
        onReload={ onReload }
      />
    );
  };

  return (
    <FocusContext.Provider value={ focusKey }>
      <Animated.View ref={ ref } style={ [styles.bar, hasFocusedChild && styles.barOpened] }>
        <ThemedScrollView
          style={ styles.tabs }
          contentContainerStyle={ styles.tabsContent }
        >
          <View>
            { topTabs.map(({ route, index }) => renderTab(route, index)) }
          </View>
          <View style={ styles.middleTabs }>
            { middleTabs.map(({ route, index }) => renderTab(route, index)) }
          </View>
          <View>
            { bottomTabs.map(({ route, index }) => renderTab(route, index)) }
          </View>
        </ThemedScrollView>
      </Animated.View>
    </FocusContext.Provider>
  );
}

export default NavigationBarComponent;
