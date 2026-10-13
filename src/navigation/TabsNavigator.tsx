import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationBar } from 'Component/NavigationBar';
import {
  NAVIGATION_BAR_ANIMATION_DURATION_MS,
  NAVIGATION_BAR_TV_WIDTH,
  NAVIGATION_BAR_TV_WIDTH_OPENED,
} from 'Component/NavigationBar/NavigationBar.style.atv';
import { useConfigContext } from 'Context/ConfigContext';
import { useNavigationContext } from 'Context/NavigationContext';
import { setTimeoutSafe } from 'Util/Misc';
import { t } from 'i18n/translate';
import Bell from 'lucide-react-native/icons/bell';
import Download from 'lucide-react-native/icons/download';
import FolderHeart from 'lucide-react-native/icons/folder-heart';
import House from 'lucide-react-native/icons/house';
import History from 'lucide-react-native/icons/rotate-ccw-clock';
import Search from 'lucide-react-native/icons/search';
import Settings from 'lucide-react-native/icons/settings';
import UserRound from 'lucide-react-native/icons/user-round';
import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { AccountScreen } from 'Screen/AccountScreen';
import AccountScreenContainer from 'Screen/AccountScreen/AccountScreen.container';
import { BookmarksScreen } from 'Screen/BookmarksScreen';
import { DownloadsScreen } from 'Screen/DownloadsScreen';
import { HomeScreen } from 'Screen/HomeScreen';
import { NotificationsScreen } from 'Screen/NotificationsScreen';
import { RecentScreen } from 'Screen/RecentScreen';
import { SearchScreen } from 'Screen/SearchScreen';
import { SettingsScreen } from 'Screen/SettingsScreen';
import { useAppTheme } from 'Theme/context';
import { Theme } from 'Theme/types';

import { createAccountNavigator } from './AccountNavigator';
import { createFilmNavigator } from './FilmNavigator';
import {
  ACCOUNT_SCREEN,
  ACCOUNT_TAB,
  BOOKMARKS_SCREEN,
  BOOKMARKS_TAB,
  DOWNLOADS_SCREEN,
  HOME_SCREEN,
  HOME_TAB,
  NOTIFICATIONS_SCREEN,
  NOTIFICATIONS_TAB,
  RECENT_SCREEN,
  RECENT_TAB,
  SEARCH_SCREEN,
  SEARCH_TAB,
  SETTINGS_SCREEN,
} from './navigationRoutes';
import { SceneMask } from './SceneMask';
import { normalizeNavigationOrder } from 'Util/NavigationOrder';

const Tab = createBottomTabNavigator();

// NOTE: `create*Navigator` returns a new component on every call, so they have to be created
// once at module level. Calling them inline in JSX would give the screens a new component
// identity on every render of `TabsNavigator` and remount them, ex. when the config changes.
const HomeNavigator = createFilmNavigator(HOME_SCREEN, HomeScreen, [
  {
    name: SETTINGS_SCREEN,
    component: SettingsScreen,
  },
]);
const SearchNavigator = createFilmNavigator(SEARCH_SCREEN, SearchScreen);
const BookmarksNavigator = createFilmNavigator(BOOKMARKS_SCREEN, BookmarksScreen);
const RecentNavigator = createFilmNavigator(RECENT_SCREEN, RecentScreen, [
  {
    name: NOTIFICATIONS_SCREEN,
    component: NotificationsScreen,
  },
]);
const NotificationsNavigator = createFilmNavigator(NOTIFICATIONS_SCREEN, NotificationsScreen);
const TVAccountNavigator = createAccountNavigator(ACCOUNT_SCREEN, AccountScreenContainer);
const MobileAccountNavigator = createAccountNavigator(ACCOUNT_SCREEN, AccountScreen);

// NOTE: these are plain render functions, not components. `Tab.Navigator` only accepts
// `Screen`, `Group` or `Fragment` as its direct children, so the group has to be returned
// inline instead of being wrapped in a component.
const renderTVTabs = (
  theme: Theme,
  scale: (value: number) => number,
  isLocalLibrary: boolean,
  tvNavigationOrder: string[],
  hiddenNavigationTabs: string[],
  layoutMenuOpen: boolean,
  transformX: number,
  isSnapping: boolean,
) => {
  const accountRoute = isLocalLibrary ? DOWNLOADS_SCREEN : ACCOUNT_TAB;
  const fallbackOrder = [
    accountRoute,
    NOTIFICATIONS_TAB,
    HOME_TAB,
    RECENT_TAB,
    SEARCH_TAB,
    BOOKMARKS_TAB,
    ...(!isLocalLibrary ? [DOWNLOADS_SCREEN] : []),
    SETTINGS_SCREEN,
  ];

  const availableRoutes = [
    accountRoute,
    NOTIFICATIONS_TAB,
    HOME_TAB,
    RECENT_TAB,
    SEARCH_TAB,
    BOOKMARKS_TAB,
    ...(!isLocalLibrary ? [DOWNLOADS_SCREEN] : []),
    SETTINGS_SCREEN,
  ];

  const navigationOrder = normalizeNavigationOrder(
    tvNavigationOrder.map(route => isLocalLibrary && route === ACCOUNT_TAB ? DOWNLOADS_SCREEN : route),
    availableRoutes,
    fallbackOrder,
  ).filter(route => !hiddenNavigationTabs.includes(route));

  const renderScreen = (routeName: string) => {
    const actualRouteName = routeName === ACCOUNT_TAB && isLocalLibrary
      ? DOWNLOADS_SCREEN
      : routeName;
    switch (actualRouteName) {
      case DOWNLOADS_SCREEN:
        return (
          <Tab.Screen
            key={ DOWNLOADS_SCREEN }
            name={ DOWNLOADS_SCREEN }
            component={ DownloadsScreen }
            options={ {
              tabBarLabel: t('Downloads'),
              tabBarIcon: Download,
            } }
          />
        );

      case ACCOUNT_TAB:
        return (
          <Tab.Screen
            key={ ACCOUNT_TAB }
            name={ ACCOUNT_TAB }
            component={ TVAccountNavigator }
            options={ {
              tabBarLabel: t('Account'),
            } }
          />
        );

      case NOTIFICATIONS_TAB:
        return (
          <Tab.Screen
            key={ NOTIFICATIONS_TAB }
            name={ NOTIFICATIONS_TAB }
            component={ NotificationsNavigator }
            options={ {
              tabBarLabel: t('Notifications'),
              tabBarIcon: Bell,
            } }
          />
        );

      case HOME_TAB:
        return (
          <Tab.Screen
            key={ HOME_TAB }
            name={ HOME_TAB }
            component={ HomeNavigator }
            options={ {
              tabBarLabel: t('Home'),
              tabBarIcon: House,
            } }
          />
        );

      case RECENT_TAB:
        return (
          <Tab.Screen
            key={ RECENT_TAB }
            name={ RECENT_TAB }
            component={ RecentNavigator }
            options={ {
              tabBarLabel: t('Recent'),
              tabBarIcon: History,
            } }
          />
        );

      case SEARCH_TAB:
        return (
          <Tab.Screen
            key={ SEARCH_TAB }
            name={ SEARCH_TAB }
            component={ SearchNavigator }
            options={ {
              tabBarLabel: t('Search'),
              tabBarIcon: Search,
            } }
          />
        );

      case BOOKMARKS_TAB:
        return (
          <Tab.Screen
            key={ BOOKMARKS_TAB }
            name={ BOOKMARKS_TAB }
            component={ BookmarksNavigator }
            options={ {
              tabBarLabel: t('Bookmarks'),
              tabBarIcon: FolderHeart,
            } }
          />
        );

      case SETTINGS_SCREEN:
        return (
          <Tab.Screen
            key={ SETTINGS_SCREEN }
            name={ SETTINGS_SCREEN }
            component={ SettingsScreen }
            options={ {
              tabBarLabel: t('Settings'),
              tabBarIcon: Settings,
            } }
          />
        );

      default:
        return null;
    }
  };

  return (
    <Tab.Group
      screenOptions={ {
        headerShown: false,
        sceneStyle: {
          backgroundColor: theme.colors.background,
          // Hybrid: the real width (marginLeft, a layout property) only ever
          // snaps -- it is set to its final value once the sidebar's own
          // transition has finished, so FlashList relayouts once per toggle
          // instead of on every animation frame. The animation itself runs on
          // `transform`, which Yoga does not treat as a layout property, so
          // it costs nothing to animate every frame. TabsNavigator keeps
          // `transform` and `marginLeft` in lockstep so the snap is invisible:
          // by the time marginLeft flips, transform has already animated to
          // the exact same on-screen position.
          marginLeft: scale(layoutMenuOpen ? NAVIGATION_BAR_TV_WIDTH_OPENED : NAVIGATION_BAR_TV_WIDTH),
          transform: [{ translateX: transformX }],
          // Suppressed for exactly the render where marginLeft snaps: that
          // render also resets transformX to 0, and animating that jump would
          // start a second, spurious 300ms transition right as the layout
          // change lands -- the one moment this must be instant.
          ...(isSnapping ? {} : {
            transitionProperty: 'transform',
            transitionDuration: `${NAVIGATION_BAR_ANIMATION_DURATION_MS}ms`,
            transitionTimingFunction: 'ease-in-out',
          }),
        },
      } }
    >
      { navigationOrder.map(renderScreen) }
    </Tab.Group>
  );
};
const renderMobileTabs = (
  theme: Theme,
  mobileNavigationOrder: string[],
  hiddenNavigationTabs: string[],
  newHomeInterface: boolean,
) => {
  const fallbackOrder = [
    HOME_TAB,
    SEARCH_TAB,
    BOOKMARKS_TAB,
    RECENT_TAB,
    NOTIFICATIONS_TAB,
    DOWNLOADS_SCREEN,
    ...(newHomeInterface ? [ACCOUNT_TAB] : []),
  ];

  const availableRoutes = [
    HOME_TAB,
    SEARCH_TAB,
    BOOKMARKS_TAB,
    RECENT_TAB,
    NOTIFICATIONS_TAB,
    DOWNLOADS_SCREEN,
    ...(newHomeInterface ? [ACCOUNT_TAB] : []),
  ];

  const navigationOrder = normalizeNavigationOrder(
    mobileNavigationOrder,
    availableRoutes,
    fallbackOrder,
  ).filter(route => !hiddenNavigationTabs.includes(route));

  const renderScreen = (routeName: string) => {
    switch (routeName) {
      case HOME_TAB:
        return (
          <Tab.Screen
            key={ HOME_TAB }
            name={ HOME_TAB }
            component={ HomeNavigator }
            options={ {
              tabBarLabel: t('Home'),
              tabBarIcon: House,
            } }
          />
        );

      case SEARCH_TAB:
        return (
          <Tab.Screen
            key={ SEARCH_TAB }
            name={ SEARCH_TAB }
            component={ SearchNavigator }
            options={ {
              tabBarLabel: t('Search'),
              tabBarIcon: Search,
            } }
          />
        );

      case BOOKMARKS_TAB:
        return (
          <Tab.Screen
            key={ BOOKMARKS_TAB }
            name={ BOOKMARKS_TAB }
            component={ BookmarksNavigator }
            options={ {
              tabBarLabel: t('Bookmarks'),
              tabBarIcon: FolderHeart,
            } }
          />
        );

      case RECENT_TAB:
        return (
          <Tab.Screen
            key={ RECENT_TAB }
            name={ RECENT_TAB }
            component={ RecentNavigator }
            options={ {
              tabBarLabel: t('Recent'),
              tabBarIcon: History,
            } }
          />
        );

      case NOTIFICATIONS_TAB:
        return (
          <Tab.Screen
            key={ NOTIFICATIONS_TAB }
            name={ NOTIFICATIONS_TAB }
            component={ NotificationsNavigator }
            options={ {
              tabBarLabel: t('Notifications'),
              tabBarIcon: Bell,
            } }
          />
        );

      case DOWNLOADS_SCREEN:
        return (
          <Tab.Screen
            key={ DOWNLOADS_SCREEN }
            name={ DOWNLOADS_SCREEN }
            component={ DownloadsScreen }
            options={ {
              tabBarLabel: t('Downloads'),
              tabBarIcon: Download,
            } }
          />
        );

      case ACCOUNT_TAB:
        return (
          <Tab.Screen
            key={ ACCOUNT_TAB }
            name={ ACCOUNT_TAB }
            component={ MobileAccountNavigator }
            listeners={ ({ navigation }) => ({
              tabPress: (event) => {
                event.preventDefault();
                navigation.navigate(ACCOUNT_TAB, {
                  screen: ACCOUNT_SCREEN,
                });
              },
            }) }
            options={ {
              tabBarLabel: t('Account'),
              tabBarIcon: UserRound,
            } }
          />
        );

      default:
        return null;
    }
  };

  return (
    <Tab.Group
      screenOptions={ {
        headerShown: false,
        sceneStyle: { backgroundColor: theme.colors.background },
      } }
    >
      { navigationOrder.map(renderScreen) }
      { !newHomeInterface && (
        <Tab.Screen
          key={ ACCOUNT_TAB }
          name={ ACCOUNT_TAB }
          component={ MobileAccountNavigator }
          options={ {
            tabBarLabel: t('Account'),
          } }
        />
      ) }
    </Tab.Group>
  );
};

/**
 * This is the main navigator for TV devices with a drawer.
 *
 * @returns {JSX.Element} The rendered MainNavigator.
 */
export function TabsNavigator() {
  // isLocalLibrary fail
  const {
    isTV,

    isLocalLibrary,
    tvNavigationOrder,
    mobileNavigationOrder,
    hiddenTVNavigationTabs,
    hiddenMobileNavigationTabs,
    newHomeInterface,
  } = useConfigContext();
  const { theme, scale } = useAppTheme();
  const { isMenuOpen } = useNavigationContext();

  // The layout-affecting margin only ever snaps to its final value -- see the
  // comment on `sceneStyle` in `renderTVTabs` for why. It starts in sync with
  // `isMenuOpen` so the very first render (no prior animation to wait out) is
  // correct without a snap.
  const [layoutMenuOpen, setLayoutMenuOpen] = useState(isMenuOpen);
  // True for exactly the render that performs the snap -- see the comment on
  // `sceneStyle` in `renderTVTabs`. Reset on the very next render via a
  // microtask-free effect so a fresh toggle immediately after a snap still
  // animates normally.
  const [isSnapping, setIsSnapping] = useState(false);
  const snapTimeoutIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (snapTimeoutIdRef.current !== null) {
      clearTimeout(snapTimeoutIdRef.current);
    }

    snapTimeoutIdRef.current = setTimeoutSafe(() => {
      setIsSnapping(true);
      setLayoutMenuOpen(isMenuOpen);
    }, NAVIGATION_BAR_ANIMATION_DURATION_MS);

    return () => {
      if (snapTimeoutIdRef.current !== null) {
        clearTimeout(snapTimeoutIdRef.current);
      }
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isSnapping) {
      return;
    }

    setIsSnapping(false);
  }, [isSnapping]);

  // Position relative to the *current* (possibly stale) layout margin, so the
  // content always renders where it visually belongs regardless of which side
  // of the snap `layoutMenuOpen` is on.
  const sidebarWidthDiff = scale(NAVIGATION_BAR_TV_WIDTH_OPENED) - scale(NAVIGATION_BAR_TV_WIDTH);
  const transformX = isMenuOpen === layoutMenuOpen
    ? 0
    : isMenuOpen
      ? sidebarWidthDiff
      : -sidebarWidthDiff;

  return (
    <View style={ { flex: 1 } }>
      <Tab.Navigator
        tabBar={ (props) => <NavigationBar { ...props } /> }
        initialRouteName={ HOME_SCREEN + '-tab' }
        screenOptions={ {
          tabBarPosition: isTV ? 'left' : 'bottom',
          popToTopOnBlur: isTV, // it will redirect to the first screen of the stack when focusing a tab, ex. user navigated to the film screen, and when he focuses again the home tab, it will go back to the home screen
          headerShown: false,
        } }
      >
        { isTV ? renderTVTabs(theme, scale, isLocalLibrary, tvNavigationOrder, hiddenTVNavigationTabs, layoutMenuOpen, transformX, isSnapping) : renderMobileTabs(theme, mobileNavigationOrder, hiddenMobileNavigationTabs, newHomeInterface) }
      </Tab.Navigator>
      { isTV && <SceneMask /> }
    </View>
  );
}
