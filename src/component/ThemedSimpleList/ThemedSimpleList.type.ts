import { ReactElement } from 'react';
import { StyleProp, ViewStyle } from 'react-native';

export interface ListItem {
  label: string;
  value: string;
  startIcon?: string;
  endIcon?: string;
}

export type ThemedSimpleListContainerProps = {
  data: ListItem[];
  value?: string,
  header?: string;
  style?: StyleProp<ViewStyle>;
  onChange: (item: ListItem) => void;
  rightAdditionalElement?: (item: ListItem, isFocused: boolean, isSelected: boolean) => ReactElement | null;
  emptyComponent?: ReactElement | null;
}

export type ThemedSimpleListComponentProps = ThemedSimpleListContainerProps;
