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

export interface NavigationBarComponentProps {
  profile: ProfileInterface | null;
  navigateTo: (tab: Tab<string>, navigation: NavigationType, state: StateType) => void;
  isFocused: (tab: Tab<string>, state: StateType) => boolean;
}

export interface Tab<T> {
  route: T;
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
