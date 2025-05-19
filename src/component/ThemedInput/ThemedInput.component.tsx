import { TextInput } from 'react-native';
import Colors from 'Style/Colors';

import { styles } from './ThemedInput.style';
import { ThemedInputComponentProps } from './ThemedInput.type';

export const ThemedInputComponent = ({
  placeholder,
  onChangeText,
  style,
  ...props
}: ThemedInputComponentProps) => (
  <TextInput
    autoComplete="off"
    placeholder={ placeholder }
    onChangeText={ onChangeText }
    style={ [
      styles.input,
      style,
    ] }
    placeholderTextColor={ Colors.white }
    selectionColor={ Colors.secondary }
    cursorColor={ Colors.secondary }
    underlineColorAndroid={ Colors.white }
    selectionHandleColor={ Colors.secondary }
    { ...props }
  />
);

export default ThemedInputComponent;
