import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import {
  CompositeScreenProps,
  NavigationContainer,
  NavigatorScreenParams,
} from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ComponentProps } from 'react';

export type TabsParamList = {
  Account: undefined
  Notifications: undefined
  Home: undefined
  Recent: undefined
  Search: undefined
  Bookmarks: undefined
}

export type AppStackParamList = {
  Welcome: undefined
  Tabs: NavigatorScreenParams<TabsParamList>
  Error: undefined
  Player: undefined
  CommentsModal: undefined
  LoginModal: undefined
  ScheduleModal: undefined
  SettingsModal: undefined

}

export type AppStackScreenProps<T extends keyof AppStackParamList> = NativeStackScreenProps<
  AppStackParamList,
  T
>

export type TabsScreenProps<T extends keyof TabsParamList> = CompositeScreenProps<
  BottomTabScreenProps<TabsParamList, T>,
  AppStackScreenProps<keyof AppStackParamList>
>

export interface NavigationProps extends Partial<
  ComponentProps<typeof NavigationContainer<AppStackParamList>>
> {}
