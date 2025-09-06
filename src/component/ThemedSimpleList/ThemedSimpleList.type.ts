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
}

export type ThemedSimpleListComponentProps = ThemedSimpleListContainerProps;