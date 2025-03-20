import { BottomTabNavigationEventMap } from '@react-navigation/bottom-tabs';
import { NavigationHelpers, ParamListBase, TabNavigationState } from '@react-navigation/native';
import { IconInterface } from 'Component/ThemedIcon/ThemedIcon.type';
import { RelativePathString } from 'expo-router';
import { ProfileInterface } from 'Type/Profile.interface';

export enum TAB_POSITION {
  TOP = 'TOP',
  MIDDLE = 'MIDDLE',
  BOTTOM = 'BOTTOM',
}

export enum TAB_COMPONENT {
  DEFAULT = 'DEFAULT',
  ACCOUNT = 'ACCOUNT',
}

export type NavigationRoute = '(account)'
| '(notifications)'
| '(+home)'
| '(recent)'
| '(search)'
| '(bookmarks)'
| 'settings'
| 'loader';

export type BadgeData = {
  [key in NavigationRoute]?: number;
}

export interface NavigationBarComponentProps {
  profile: ProfileInterface | null;
  navigateTo: (tab: Tab, navigation: NavigationType, state: StateType) => void;
  isFocused: (tab: Tab, state: StateType) => boolean;
}

export interface Tab {
  route: NavigationRoute;
  title: string;
  icon?: IconInterface;
  iconFocused?: IconInterface;
  options?: {
    href?: RelativePathString | null;
  };
  position?: TAB_POSITION;
  tabComponent?: TAB_COMPONENT;
}

export type NavigationType = NavigationHelpers<ParamListBase, BottomTabNavigationEventMap>;
export type StateType = TabNavigationState<ParamListBase>;
