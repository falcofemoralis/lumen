import { ComponentType } from 'react';
import { StyleProp, ViewStyle } from 'react-native';

export interface InfoBlockContainerProps {
  title: string;
  subtitle: string;
  hideIcon?: boolean;
  style?: StyleProp<ViewStyle>;
  Icon?: ComponentType<any>;
}

export interface InfoBlockComponentProps {
  title: string;
  subtitle: string;
  hideIcon?: boolean;
  style?: StyleProp<ViewStyle>;
  Icon?: ComponentType<any>;
}
