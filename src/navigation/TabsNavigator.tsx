import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationBar } from 'Component/NavigationBar';
import { useConfigContext } from 'Context/ConfigContext';
import { t } from 'i18n/translate';
import { Bell, FolderHeart, History, House, Search, Settings } from 'lucide-react-native';
import { AccountScreen } from 'Screen/AccountScreen';
import { BookmarksScreen } from 'Screen/BookmarksScreen';
import { HomeScreen } from 'Screen/HomeScreen';
import { LoaderScreen } from 'Screen/LoaderScreen';
import { NotificationsScreen } from 'Screen/NotificationsScreen';
import { RecentScreen } from 'Screen/RecentScreen';
import { SearchScreen } from 'Screen/SearchScreen';
import { SettingsScreen } from 'Screen/SettingsScreen';
import { useAppTheme } from 'Theme/context';

import { createAccountNavigator } from './AccountNavigator';
import { createFilmNavigator } from './FilmNavigator';
import {
  ACCOUNT_SCREEN,
  ACCOUNT_TAB,
  BOOKMARKS_SCREEN,
  BOOKMARKS_TAB,
  HOME_SCREEN,
  HOME_TAB,
  LOADER_SCREEN,
  NOTIFICATIONS_SCREEN,
  NOTIFICATIONS_TAB,
  RECENT_SCREEN,
  RECENT_TAB,
  SEARCH_SCREEN,
  SEARCH_TAB,
  SETTINGS_SCREEN,
} from './navigationRoutes';

const Tab = createBottomTabNavigator();

/**
 * This is the main navigator for TV devices with a drawer.
 *
 * @returns {JSX.Element} The rendered `MainNavigator`.
 */
export function TabsNavigator() {
  const { isTV, initialRoute } = useConfigContext();
  const { theme } = useAppTheme();

  return (
    <Tab.Navigator
      tabBar={ (props) => <NavigationBar { ...props } /> }
      initialRouteName={ `${initialRoute}-tab` }
      screenOptions={ {
        tabBarPosition: isTV ? 'left' : 'bottom',
        popToTopOnBlur: isTV, // it will redirect to the first screen of the stack when focusing a tab, ex. user navigated to the film screen, and when he focuses again the home tab, it will go back to the home screen
        headerShown: false,
      } }
    >
      <Tab.Group
        screenOptions={ {
          headerShown: false,
          sceneStyle: { backgroundColor: theme.colors.background },
        } }
      >
        { isTV ? (
          <>
            <Tab.Screen
              key={ ACCOUNT_TAB }
              name={ ACCOUNT_TAB }
              component={ createAccountNavigator(ACCOUNT_SCREEN, AccountScreen) }
              options={ {
                tabBarLabel: t('Account'),
              } }
            />
            <Tab.Screen
              key={ NOTIFICATIONS_TAB }
              name={ NOTIFICATIONS_TAB }
              component={ createFilmNavigator(NOTIFICATIONS_SCREEN, NotificationsScreen) }
              options={ {
                tabBarLabel: t('Notifications'),
                tabBarIcon: Bell,
              } }
            />
            <Tab.Screen
              key={ HOME_TAB }
              name={ HOME_TAB }
              component={ createFilmNavigator(HOME_SCREEN, HomeScreen) }
              options={ {
                tabBarLabel: t('Home'),
                tabBarIcon: House,
              } }
            />
            <Tab.Screen
              key={ RECENT_TAB }
              name={ RECENT_TAB }
              component={ createFilmNavigator(RECENT_SCREEN, RecentScreen) }
              options={ {
                tabBarLabel: t('Recent'),
                tabBarIcon: History,
              } }
            />
            <Tab.Screen
              key={ SEARCH_TAB }
              name={ SEARCH_TAB }
              component={ createFilmNavigator(SEARCH_SCREEN, SearchScreen) }
              options={ {
                tabBarLabel: t('Search'),
                tabBarIcon: Search,
              } }
            />
            <Tab.Screen
              key={ BOOKMARKS_TAB }
              name={ BOOKMARKS_TAB }
              component={ createFilmNavigator(BOOKMARKS_SCREEN, BookmarksScreen) }
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
            <Tab.Screen
              key={ LOADER_SCREEN }
              name={ LOADER_SCREEN }
              component={ LoaderScreen }
            />
          </>
        ) : (
          <>
            <Tab.Screen
              key={ HOME_TAB }
              name={ HOME_TAB }
              component={ createFilmNavigator(HOME_SCREEN, HomeScreen) }
              options={ {
                tabBarLabel: t('Home'),
                tabBarIcon: House,
              } }
            />
            <Tab.Screen
              key={ SEARCH_TAB }
              name={ SEARCH_TAB }
              component={ createFilmNavigator(SEARCH_SCREEN, SearchScreen) }
              options={ {
                tabBarLabel: t('Search'),
                tabBarIcon: Search,
              } }
            />
            <Tab.Screen
              key={ BOOKMARKS_TAB }
              name={ BOOKMARKS_TAB }
              component={ createFilmNavigator(BOOKMARKS_SCREEN, BookmarksScreen) }
              options={ {
                tabBarLabel: t('Bookmarks'),
                tabBarIcon: FolderHeart,
              } }
            />
            <Tab.Screen
              key={ RECENT_TAB }
              name={ RECENT_TAB }
              component={ createFilmNavigator(RECENT_SCREEN, RecentScreen) }
              options={ {
                tabBarLabel: t('Recent'),
                tabBarIcon: History,
              } }
            />
            <Tab.Screen
              key={ ACCOUNT_TAB }
              name={ ACCOUNT_TAB }
              component={ createAccountNavigator(ACCOUNT_SCREEN, AccountScreen) }
              options={ {
                tabBarLabel: t('Account'),
              } }
            />
          </>
        ) }
      </Tab.Group>
    </Tab.Navigator>
  );
}
