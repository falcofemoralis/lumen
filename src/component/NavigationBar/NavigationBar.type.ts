import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { ProfileInterface } from 'Type/Profile.interface';

export type NavigationBarContainerProps = BottomTabBarProps

export type NavigationBarComponentProps = {
  profile: ProfileInterface | null;
  onPress: (name: string) => void;
  onLongPress: (name: string) => void;
} & NavigationBarContainerProps
