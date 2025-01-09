import { BottomTabNavigationEventMap } from '@react-navigation/bottom-tabs';
import { NavigationHelpers, ParamListBase, TabNavigationState } from '@react-navigation/native';
import { IconInterface } from 'Component/ThemedIcon/ThemedIcon.type';
import { RelativePathString } from 'expo-router';

export interface NavigationBarComponentProps {
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
}

export type NavigationType = NavigationHelpers<ParamListBase, BottomTabNavigationEventMap>;
export type StateType = TabNavigationState<ParamListBase>;
