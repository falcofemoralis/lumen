import { RefObject } from 'react';
import { StyleProp, TextInput, TextInputProps, TextStyle, ViewStyle } from 'react-native';

export interface ThemedInputContainerProps extends TextInputProps {
  placeholder: string;
  onChangeText: (t: string) => void;
  style?: StyleProp<TextStyle> | undefined;
  containerStyle?: StyleProp<ViewStyle> | undefined;
  editable?: boolean;
  // TV related
  ref?: RefObject<TextInput | null>;
  autofocus?: boolean;
  focusKey?: string;
}

export type ThemedInputComponentProps = ThemedInputContainerProps;
