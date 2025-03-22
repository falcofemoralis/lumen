import { TextInput } from 'react-native-paper';
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
    mode="flat"
    placeholder={ placeholder }
    onChangeText={ onChangeText }
    style={ [
      styles.input,
      style,
    ] }
    placeholderTextColor={ Colors.white }
    textColor={ Colors.white }
    selectionColor={ Colors.secondary }
    underlineColor={ Colors.secondary }
    outlineColor={ Colors.secondary }
    activeOutlineColor={ Colors.secondary }
    cursorColor={ Colors.secondary }
    underlineColorAndroid={ Colors.white }
    activeUnderlineColor={ Colors.secondary }
    selectionHandleColor={ Colors.secondary }
    { ...props }
  />
);

export default ThemedInputComponent;
