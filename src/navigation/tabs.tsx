import { BottomTabNavigationOptions, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import NavigationBar from 'Component/NavigationBar';
import t from 'i18n/t';
import { Bell, FolderHeart, History, House, Search, Settings } from 'lucide-react-native';
import AccountPage from 'Route/AccountPage';
import { ACCOUNT_ROUTE } from 'Route/AccountPage/AccountPage.config';
import BookmarksPage from 'Route/BookmarksPage';
import { BOOKMARKS_ROUTE } from 'Route/BookmarksPage/BookmarksPage.config';
import HomePage from 'Route/HomePage';
import { HOME_ROUTE } from 'Route/HomePage/HomePage.config';
import LoaderPage from 'Route/LoaderPage';
import { LOADER_ROUTE } from 'Route/LoaderPage/LoaderPage.config';
import NotificationsPage from 'Route/NotificationsPage';
import { NOTIFICATIONS_ROUTE } from 'Route/NotificationsPage/NotificationsPage.config';
import RecentPage from 'Route/RecentPage';
import { RECENT_ROUTE } from 'Route/RecentPage/RecentPage.config';
import SearchPage from 'Route/SearchPage';
import { SEARCH_ROUTE } from 'Route/SearchPage/SearchPage.config';
import SettingsPage from 'Route/SettingsPage';
import { SETTINGS_ROUTE } from 'Route/SettingsPage/SettingsPage.config';
import ConfigStore from 'Store/Config.store';

import { createAccountStack } from './accountStack';
import { createFilmStack } from './filmStack';
import { createSettingsStack } from './settingsStack';

const Tabs = createBottomTabNavigator();

export const TabsStack = () => {
  const screens: Record<
    string,
    { screen: any; options: BottomTabNavigationOptions }
  > = ConfigStore.isTV()
    ? {
      [ACCOUNT_ROUTE]: {
        screen: AccountPage,
        options: {
          tabBarLabel: t('You'),
        },
      },
      [NOTIFICATIONS_ROUTE]: {
        screen: createFilmStack(NOTIFICATIONS_ROUTE, NotificationsPage),
        options: {
          tabBarLabel: t('Notifications'),
          tabBarIcon: Bell,
        },
      },
      [HOME_ROUTE]: {
        screen: createFilmStack(HOME_ROUTE, HomePage),
        options: {
          tabBarLabel: t('Home'),
          tabBarIcon: House,
        },
      },
      [RECENT_ROUTE]: {
        screen: createFilmStack(RECENT_ROUTE, RecentPage),
        options: {
          tabBarLabel: t('Recent'),
          tabBarIcon: History,
        },
      },
      [SEARCH_ROUTE]: {
        screen: createFilmStack(SEARCH_ROUTE, SearchPage),
        options: {
          tabBarLabel: t('Search'),
          tabBarIcon: Search,
        },
      },
      [BOOKMARKS_ROUTE]: {
        screen: createFilmStack(BOOKMARKS_ROUTE, BookmarksPage),
        options: {
          tabBarLabel: t('Bookmarks'),
          tabBarIcon: FolderHeart,
        },
      },
      [SETTINGS_ROUTE]: {
        screen: createSettingsStack(SETTINGS_ROUTE, SettingsPage),
        options: {
          tabBarLabel: t('Settings'),
          tabBarIcon: Settings,
        },
      },
      [LOADER_ROUTE]: {
        screen: LoaderPage,
        options: {},
      },
    } :
    {
      [HOME_ROUTE]: {
        screen: createFilmStack(HOME_ROUTE, HomePage),
        options: {
          tabBarLabel: t('Home'),
          tabBarIcon: House,
        },
      },
      [SEARCH_ROUTE]: {
        screen: createFilmStack(SEARCH_ROUTE, SearchPage),
        options: {
          tabBarLabel: t('Search'),
          tabBarIcon: Search,
        },
      },
      [BOOKMARKS_ROUTE]: {
        screen: createFilmStack(BOOKMARKS_ROUTE, BookmarksPage),
        options: {
          tabBarLabel: t('Bookmarks'),
          tabBarIcon: FolderHeart,
        },
      },
      [RECENT_ROUTE]: {
        screen: createFilmStack(RECENT_ROUTE, RecentPage),
        options: {
          tabBarLabel: t('Recent'),
          tabBarIcon: History,
        },
      },
      [ACCOUNT_ROUTE]: {
        screen: createAccountStack(ACCOUNT_ROUTE, AccountPage),
        options: {
          tabBarLabel: t('You'),
        },
      },
    };

  return (
    <Tabs.Navigator
      tabBar={ (props) => <NavigationBar { ...props } /> }
      initialRouteName={ ConfigStore.getConfig().initialRoute }
      screenOptions={ {
        tabBarPosition: ConfigStore.isTV() ? 'left' : 'bottom',
        popToTopOnBlur: ConfigStore.isTV(),
      } }
    >
      <Tabs.Group
        screenOptions={ {
          headerShown: false,
        } }
      >
        { Object.entries(screens).map(([name, config]) => (
          <Tabs.Screen
            key={ name }
            name={ name }
            component={ config.screen }
            options={ config.options }
          />
        )) }
      </Tabs.Group>
    </Tabs.Navigator>
  );
};

export default TabsStack;