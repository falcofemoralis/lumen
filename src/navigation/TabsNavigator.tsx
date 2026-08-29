import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationBar } from 'Component/NavigationBar';
import { useConfigContext } from 'Context/ConfigContext';
import { t } from 'i18n/translate';
import Bell from 'lucide-react-native/icons/bell';
import Download from 'lucide-react-native/icons/download';
import FolderHeart from 'lucide-react-native/icons/folder-heart';
import House from 'lucide-react-native/icons/house';
import History from 'lucide-react-native/icons/rotate-ccw-clock';
import Search from 'lucide-react-native/icons/search';
import Settings from 'lucide-react-native/icons/settings';
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

const Tab = createBottomTabNavigator();

// NOTE: `create*Navigator` returns a new component on every call, so they have to be created
// once at module level. Calling them inline in JSX would give the screens a new component
// identity on every render of `TabsNavigator` and remount them, ex. when the config changes.
const HomeNavigator = createFilmNavigator(HOME_SCREEN, HomeScreen);
const SearchNavigator = createFilmNavigator(SEARCH_SCREEN, SearchScreen);
const BookmarksNavigator = createFilmNavigator(BOOKMARKS_SCREEN, BookmarksScreen);
const RecentNavigator = createFilmNavigator(RECENT_SCREEN, RecentScreen);
const NotificationsNavigator = createFilmNavigator(NOTIFICATIONS_SCREEN, NotificationsScreen);
const TVAccountNavigator = createAccountNavigator(ACCOUNT_SCREEN, AccountScreenContainer);
const MobileAccountNavigator = createAccountNavigator(ACCOUNT_SCREEN, AccountScreen);

// NOTE: these are plain render functions, not components. `Tab.Navigator` only accepts
// `Screen`, `Group` or `Fragment` as its direct children, so the group has to be returned
// inline instead of being wrapped in a component.
const renderTVTabs = (theme: Theme, isLocalLibrary: boolean) => {
  return (
    <Tab.Group
      screenOptions={ {
        headerShown: false,
        sceneStyle: { backgroundColor: theme.colors.background },
      } }
    >
      { isLocalLibrary ? (
        <Tab.Screen
          key={ DOWNLOADS_SCREEN }
          name={ DOWNLOADS_SCREEN }
          component={ DownloadsScreen }
          options={ {
            tabBarLabel: t('Downloads'),
            tabBarIcon: Download,
          } }
        />
      ) : (
        <Tab.Screen
          key={ ACCOUNT_TAB }
          name={ ACCOUNT_TAB }
          component={ TVAccountNavigator }
          options={ {
            tabBarLabel: t('Account'),
          } }
        />
      ) }
      <Tab.Screen
        key={ NOTIFICATIONS_TAB }
        name={ NOTIFICATIONS_TAB }
        component={ NotificationsNavigator }
        options={ {
          tabBarLabel: t('Notifications'),
          tabBarIcon: Bell,
        } }
      />
      <Tab.Screen
        key={ HOME_TAB }
        name={ HOME_TAB }
        component={ HomeNavigator }
        options={ {
          tabBarLabel: t('Home'),
          tabBarIcon: House,
        } }
      />
      <Tab.Screen
        key={ RECENT_TAB }
        name={ RECENT_TAB }
        component={ RecentNavigator }
        options={ {
          tabBarLabel: t('Recent'),
          tabBarIcon: History,
        } }
      />
      <Tab.Screen
        key={ SEARCH_TAB }
        name={ SEARCH_TAB }
        component={ SearchNavigator }
        options={ {
          tabBarLabel: t('Search'),
          tabBarIcon: Search,
        } }
      />
      <Tab.Screen
        key={ BOOKMARKS_TAB }
        name={ BOOKMARKS_TAB }
        component={ BookmarksNavigator }
        options={ {
          tabBarLabel: t('Bookmarks'),
          tabBarIcon: FolderHeart,
        } }
      />
      <Tab.Screen
        key={ SETTINGS_SCREEN }
        name={ SETTINGS_SCREEN }
        component={ SettingsScreen }
        options={ {
          tabBarLabel: t('Settings'),
          tabBarIcon: Settings,
        } }
      />
    </Tab.Group>
  );
};

const renderMobileTabs = (theme: Theme) => {
  return (
    <Tab.Group
      screenOptions={ {
        headerShown: false,
        sceneStyle: { backgroundColor: theme.colors.background },
      } }
    >
      <Tab.Screen
        key={ HOME_TAB }
        name={ HOME_TAB }
        component={ HomeNavigator }
        options={ {
          tabBarLabel: t('Home'),
          tabBarIcon: House,
        } }
      />
      <Tab.Screen
        key={ SEARCH_TAB }
        name={ SEARCH_TAB }
        component={ SearchNavigator }
        options={ {
          tabBarLabel: t('Search'),
          tabBarIcon: Search,
        } }
      />
      <Tab.Screen
        key={ BOOKMARKS_TAB }
        name={ BOOKMARKS_TAB }
        component={ BookmarksNavigator }
        options={ {
          tabBarLabel: t('Bookmarks'),
          tabBarIcon: FolderHeart,
        } }
      />
      <Tab.Screen
        key={ RECENT_TAB }
        name={ RECENT_TAB }
        component={ RecentNavigator }
        options={ {
          tabBarLabel: t('Recent'),
          tabBarIcon: History,
        } }
      />
      <Tab.Screen
        key={ ACCOUNT_TAB }
        name={ ACCOUNT_TAB }
        component={ MobileAccountNavigator }
        options={ {
          tabBarLabel: t('Account'),
        } }
      />
    </Tab.Group>
  );
};

/**
 * This is the main navigator for TV devices with a drawer.
 *
 * @returns {JSX.Element} The rendered `MainNavigator`.
 */
export function TabsNavigator() {
  // isLocalLibrary fail
  const { isTV, initialRoute, isLocalLibrary } = useConfigContext();
  const { theme } = useAppTheme();

  return (
    <View style={ { flex: 1 } }>
      <Tab.Navigator
        tabBar={ (props) => <NavigationBar { ...props } /> }
        initialRouteName={ `${initialRoute}-tab` }
        screenOptions={ {
          tabBarPosition: isTV ? 'left' : 'bottom',
          popToTopOnBlur: isTV, // it will redirect to the first screen of the stack when focusing a tab, ex. user navigated to the film screen, and when he focuses again the home tab, it will go back to the home screen
          headerShown: false,
        } }
      >
        { isTV ? renderTVTabs(theme, isLocalLibrary) : renderMobileTabs(theme) }
      </Tab.Navigator>
      { isTV && <SceneMask /> }
    </View>
  );
}