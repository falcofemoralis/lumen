import { StyleProp, TextInputProps, TextStyle, ViewStyle } from 'react-native';

export interface ThemedInputContainerProps extends TextInputProps {
  placeholder: string;
  onChangeText: (t: string) => void;
  style?: StyleProp<TextStyle> | undefined;
  containerStyle?: StyleProp<ViewStyle> | undefined;
}

export interface ThemedInputComponentProps extends ThemedInputContainerProps {
}
