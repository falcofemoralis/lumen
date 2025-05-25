import { StyleProp, TextInputProps, TextStyle } from 'react-native';

export interface ThemedInputContainerProps extends TextInputProps {
  placeholder: string;
  onChangeText: (t: string) => void;
  style?: StyleProp<TextStyle> | undefined;
  useSoftInput?: boolean;
}

export interface ThemedInputComponentProps extends ThemedInputContainerProps {
  useSoftInput?: boolean;
}
