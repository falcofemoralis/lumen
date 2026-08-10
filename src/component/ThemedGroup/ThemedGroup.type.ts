import { ReactNode } from 'react';
import { StyleProp, ViewStyle } from 'react-native';

export type ThemedGroupContainerProps = {
  children?: ReactNode
  style?: StyleProp<ViewStyle>
  // TV related
  preferredChildFocusKey?: string
  focusKey?: string
}

export type ThemedGroupComponentProps = ThemedGroupContainerProps;