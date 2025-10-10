import { BottomTabNavigationOptions, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import NavigationBar from 'Component/NavigationBar';
import t from 'i18n/t';
import { Bell, FolderHeart, History, House, Search, Settings } from 'lucide-react-native';
import AccountPage from 'Route/AccountPage';
import BookmarksPage from 'Route/BookmarksPage';
import HomePage from 'Route/HomePage';
import LoaderPage from 'Route/LoaderPage';
import NotificationsPage from 'Route/NotificationsPage';
import RecentPage from 'Route/RecentPage';
import SearchPage from 'Route/SearchPage';
import SettingsPage from 'Route/SettingsPage';
import ConfigStore from 'Store/Config.store';

import { createAccountStack } from './accountStack';
import { createFilmStack } from './filmStack';
import {
  ACCOUNT_ROUTE,
  BOOKMARKS_ROUTE,
  HOME_ROUTE,
  LOADER_ROUTE,
  NOTIFICATIONS_ROUTE,
  RECENT_ROUTE,
  SEARCH_ROUTE,
  SETTINGS_ROUTE,
} from './routes';
import { createSettingsStack } from './settingsStack';

const Tabs = createBottomTabNavigator();

type Route = Record<
  string,
  {
    screen: () => () => React.JSX.Element,
    options: BottomTabNavigationOptions
  }
>;

const TV_ROUTES: Route = {
  [ACCOUNT_ROUTE]: {
    screen: () => AccountPage,
    options: {
      tabBarLabel: t('Account'),
    },
  },
  [NOTIFICATIONS_ROUTE]: {
    screen: () => createFilmStack(NOTIFICATIONS_ROUTE, NotificationsPage),
    options: {
      tabBarLabel: t('Notifications'),
      tabBarIcon: Bell,
    },
  },
  [HOME_ROUTE]: {
    screen: () => createFilmStack(HOME_ROUTE, HomePage),
    options: {
      tabBarLabel: t('Home'),
      tabBarIcon: House,
    },
  },
  [RECENT_ROUTE]: {
    screen: () => createFilmStack(RECENT_ROUTE, RecentPage),
    options: {
      tabBarLabel: t('Recent'),
      tabBarIcon: History,
    },
  },
  [SEARCH_ROUTE]: {
    screen: () => createFilmStack(SEARCH_ROUTE, SearchPage),
    options: {
      tabBarLabel: t('Search'),
      tabBarIcon: Search,
    },
  },
  [BOOKMARKS_ROUTE]: {
    screen: () => createFilmStack(BOOKMARKS_ROUTE, BookmarksPage),
    options: {
      tabBarLabel: t('Bookmarks'),
      tabBarIcon: FolderHeart,
    },
  },
  [SETTINGS_ROUTE]: {
    screen: () => createSettingsStack(SETTINGS_ROUTE, SettingsPage),
    options: {
      tabBarLabel: t('Settings'),
      tabBarIcon: Settings,
    },
  },
  [LOADER_ROUTE]: {
    screen: () => LoaderPage,
    options: {},
  },
};

const MOBILE_ROUTES: Route = {
  [HOME_ROUTE]: {
    screen: () => createFilmStack(HOME_ROUTE, HomePage),
    options: {
      tabBarLabel: t('Home'),
      tabBarIcon: House,
    },
  },
  [SEARCH_ROUTE]: {
    screen: () => createFilmStack(SEARCH_ROUTE, SearchPage),
    options: {
      tabBarLabel: t('Search'),
      tabBarIcon: Search,
    },
  },
  [BOOKMARKS_ROUTE]: {
    screen: () => createFilmStack(BOOKMARKS_ROUTE, BookmarksPage),
    options: {
      tabBarLabel: t('Bookmarks'),
      tabBarIcon: FolderHeart,
    },
  },
  [RECENT_ROUTE]: {
    screen: () => createFilmStack(RECENT_ROUTE, RecentPage),
    options: {
      tabBarLabel: t('Recent'),
      tabBarIcon: History,
    },
  },
  [ACCOUNT_ROUTE]: {
    screen: () => createAccountStack(ACCOUNT_ROUTE, AccountPage),
    options: {
      tabBarLabel: t('Account'),
    },
  },
};

export const TabsStack = () => {
  const screens = ConfigStore.isTV() ? TV_ROUTES: MOBILE_ROUTES;

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
            component={ config.screen() }
            options={ config.options }
          />
        )) }
      </Tabs.Group>
    </Tabs.Navigator>
  );
};

export default TabsStack;