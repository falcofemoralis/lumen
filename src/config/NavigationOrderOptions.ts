import Tv from 'lucide-react-native/icons/tv';
import Radio from 'lucide-react-native/icons/radio';
import Clapperboard from 'lucide-react-native/icons/clapperboard';
import Bell from 'lucide-react-native/icons/bell';
import Download from 'lucide-react-native/icons/download';
import FolderHeart from 'lucide-react-native/icons/folder-heart';
import House from 'lucide-react-native/icons/house';
import History from 'lucide-react-native/icons/rotate-ccw-clock';
import Search from 'lucide-react-native/icons/search';
import UserRound from 'lucide-react-native/icons/user-round';

import { t } from 'i18n/translate';
import {
  BOOKMARKS_TAB,
  DOWNLOADS_SCREEN,
  HOME_TAB,
  NOTIFICATIONS_TAB,
  RECENT_TAB,
  SEARCH_TAB,
  BROADCAST_TAB,
  ACCOUNT_TAB,
} from 'Navigation/navigationRoutes';
import { NavigationOrderItem } from 'Component/NavigationOrderSetting/NavigationOrderSetting.type';

export const getTVNavigationOrderItems = (): NavigationOrderItem[] => [
  { value: DOWNLOADS_SCREEN, label: t('Downloads'), IconComponent: Download },
  {
    value: NOTIFICATIONS_TAB,
    label: t('Notifications'),
    IconComponent: Bell,
  },
  {
    value: HOME_TAB,
    label: t('Home'),
    IconComponent: House,
  },
  {
    value: RECENT_TAB,
    label: t('Recent'),
    IconComponent: History,
  },
  {
    value: SEARCH_TAB,
    label: t('Search'),
    IconComponent: Search,
  },
  { value: BROADCAST_TAB, label: t('TV and radio'), IconComponent: Tv },
  {
    value: BOOKMARKS_TAB,
    label: t('Bookmarks'),
    IconComponent: FolderHeart,
  },
];

export const getMobileNavigationOrderItems = (includeAccount = false): NavigationOrderItem[] => [
  {
    value: HOME_TAB,
    label: t('Home'),
    IconComponent: House,
  },
  {
    value: SEARCH_TAB,
    label: t('Search'),
    IconComponent: Search,
  },
  { value: BROADCAST_TAB, label: t('TV and radio'), IconComponent: Tv },
  {
    value: BOOKMARKS_TAB,
    label: t('Bookmarks'),
    IconComponent: FolderHeart,
  },
  {
    value: RECENT_TAB,
    label: t('Recent'),
    IconComponent: History,
  },
  {
    value: NOTIFICATIONS_TAB,
    label: t('Notifications'),
    IconComponent: Bell,
  },
  {
    value: DOWNLOADS_SCREEN,
    label: t('Downloads'),
    IconComponent: Download,
  },
  ...(includeAccount ? [{
    value: ACCOUNT_TAB,
    label: t('Account'),
    IconComponent: UserRound,
  }] : []),
];

export const getBroadcastOrderItems = (): NavigationOrderItem[] => [
  { value: 'shows', label: t('TV shows'), IconComponent: Clapperboard },
  { value: 'radio', label: t('Radio'), IconComponent: Radio },
  { value: 'tv', label: t('TV channels'), IconComponent: Tv },
];