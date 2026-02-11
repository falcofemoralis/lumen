import { NavigationRoute, ParamListBase } from '@react-navigation/native';
import { ThemedImage } from 'Component/ThemedImage';
import { ThemedPressable } from 'Component/ThemedPressable';
import { ThemedText } from 'Component/ThemedText';
import { useNavigationContext } from 'Context/NavigationContext';
import { useServiceContext } from 'Context/ServiceContext';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import { ACCOUNT_TAB, LOADER_SCREEN, SETTINGS_SCREEN } from 'Navigation/navigationRoutes';
import { createRef, memo, useCallback, useMemo, useRef } from 'react';
import { Image, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { DefaultFocus, Directions, SpatialNavigationRoot, SpatialNavigationView } from 'react-tv-space-navigation';
import { useAppTheme } from 'Theme/context';
import { BadgeData } from 'Type/BadgeData.interface';
import { ProfileInterface } from 'Type/Profile.interface';
import { setTimeoutSafe } from 'Util/Misc';

import { componentStyles } from './NavigationBar.style.atv';
import { NavigationBarComponentProps } from './NavigationBar.type';

export const navigationBarRef = createRef<View>();

export function NavigationBarComponent({
  state,
  descriptors,
  profile,
  onPress,
}: NavigationBarComponentProps) {
  const { isMenuOpen, toggleMenu } = useNavigationContext();
  const { badgeData } = useServiceContext();
  const styles = useThemedStyles(componentStyles);
  const lastPage = useRef<string | null>(state.routes[state.index]?.name || null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const onDirectionHandledWithoutMovement = useCallback(
    (movement: string) => {
      if (movement === Directions.RIGHT) {
        toggleMenu(false);
      }
    },
    [toggleMenu]
  );

  const onTabSelect = useCallback((name: string) => {
    if (!isMenuOpen) {
      return;
    }

    if (lastPage.current !== LOADER_SCREEN) {
      setTimeoutSafe(() => {
        onPress(LOADER_SCREEN);
      }, 0);
      lastPage.current = LOADER_SCREEN;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeoutSafe(() => {
      onPress(name);
      lastPage.current = name;
    }, 500);
  }, [onPress, isMenuOpen]);

  const renderTab = (
    route: NavigationRoute<ParamListBase, string>,
    index: number
  ) => {
    return (
      <MemoizedNavigationTab
        key={ route.name }
        styles={ styles }
        onTabSelect={ onTabSelect }
        badgeData={ badgeData }
        descriptors={ descriptors }
        profile={ profile }
        isActiveTab={ state.index === index }
        name={ route.name }
        routeKey={ route.key }
      />
    );
  };

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
        case LOADER_SCREEN:
          break;
        default:
          mt.push({ route, index });
          break;
      }
    });

    return { topTabs: tt, middleTabs: mt, bottomTabs: bt };
  }, [state.routes]);

  return (
    <SpatialNavigationRoot
      isActive={ isMenuOpen }
      onDirectionHandledWithoutMovement={ onDirectionHandledWithoutMovement }
    >
      <Animated.View style={ [styles.bar, isMenuOpen && styles.barOpened] }>
        <SpatialNavigationView direction="vertical" style={ { width: '100%' } }>
          <View style={ styles.tabs }>
            <View>
              { topTabs.map(({ route, index }) => renderTab(route, index)) }
            </View>
            <View>
              { middleTabs.map(({ route, index }) => renderTab(route, index)) }
            </View>
            <View>
              { bottomTabs.map(({ route, index }) => renderTab(route, index)) }
            </View>
          </View>
        </SpatialNavigationView>
      </Animated.View>
    </SpatialNavigationRoot>
  );
}

type NavigationTabProps = {
  styles: any,
  badgeData: BadgeData,
  onTabSelect: (name: string) => void,
  descriptors: Record<string, any>,
  profile?: ProfileInterface | null,
  isActiveTab: boolean,
  name: string,
  routeKey: string,
};

const NavigationTab = ({
  styles,
  onTabSelect,
  badgeData,
  descriptors,
  profile,
  isActiveTab,
  name,
  routeKey,
}: NavigationTabProps) => {
  const { theme } = useAppTheme();
  const { isSignedIn } = useServiceContext();

  const renderDefaultTab = (
    isRootActive: boolean,
    isf: boolean
  ) => {
    const { options } = descriptors[routeKey] ?? {};
    const { tabBarIcon: IconComponent } = options as { tabBarIcon: React.ComponentType<any> };
    const { tabBarLabel } = options;
    const badgeCount = badgeData[name] || 0;

    return (
      <View
        style={ [
          styles.tab,
          isActiveTab && !isRootActive && styles.tabSelected,
          isf && isRootActive && styles.tabFocused,
        ] }
      >
        <View>
          { IconComponent && (
            <IconComponent
              style={ styles.tabIcon }
              size={ styles.tabIcon.width }
              color={ isf && isRootActive ? theme.colors.iconFocused : theme.colors.icon }
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
            isf && isRootActive && styles.tabContentFocused,
          ] }
        >
          { typeof tabBarLabel === 'function'
            ? tabBarLabel({
              focused: isActiveTab,
              color: isf && isRootActive ? theme.colors.iconFocused : theme.colors.icon,
              position: 'below-icon',
              children: '',
            }) : tabBarLabel }
        </ThemedText>
      </View>
    );
  };

  const renderAccountTab = (
    isRootActive: boolean,
    isf: boolean
  ) => {
    const { options } = descriptors[routeKey] ?? {};
    const { tabBarLabel } = options;
    const { avatar } = profile ?? {};

    return (
      <View
        style={ [
          styles.tab,
          isActiveTab && !isRootActive && styles.tabSelected,
          isf && isRootActive && styles.tabFocused,
        ] }
      >
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
              isf && isRootActive && styles.tabContentFocused,
            ] }
          >
            { typeof tabBarLabel === 'function'
              ? tabBarLabel({
                focused: isActiveTab,
                color: isf && isRootActive ? theme.colors.iconFocused : theme.colors.icon,
                position: 'below-icon',
                children: '',
              }) : tabBarLabel }
          </ThemedText>
          <ThemedText
            style={ [
              styles.tabText,
              styles.profileSwitchText,
              isf && isRootActive && styles.tabContentFocused,
            ] }
          >
            { isSignedIn ? t('You') : t('Sign in') }
          </ThemedText>
        </View>
      </View>
    );
  };

  return (
    <DefaultFocus
      key={ name }
      enable={ isActiveTab }
    >
      <ThemedPressable
        onFocus={ () => {
          onTabSelect(name);
        } }
        onPress={ () => onTabSelect(name) }
      >
        { ({ isRootActive, isFocused: isf }) => {
          switch (name) {
            case ACCOUNT_TAB:
              return renderAccountTab(isRootActive, isf);
            default:
              return renderDefaultTab(isRootActive, isf);
          }
        } }
      </ThemedPressable>
    </DefaultFocus>
  );
};

const MemoizedNavigationTab = memo(NavigationTab);

export default NavigationBarComponent;
