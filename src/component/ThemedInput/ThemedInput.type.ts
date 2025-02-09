import { StyleProp, TextStyle } from 'react-native';
import { TextInputProps } from 'react-native-paper';

export interface ThemedInputContainerProps extends TextInputProps {
  placeholder: string;
  onChangeText: (t: string) => void;
  style?: StyleProp<TextStyle> | undefined;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ThemedInputComponentProps extends ThemedInputContainerProps {
}
