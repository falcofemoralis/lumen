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
    selectionColor="white"
    underlineColor="red"
    outlineColor="blue"
    activeOutlineColor="green"
    cursorColor="yellow"
    underlineColorAndroid={ Colors.white }
    activeUnderlineColor="green"
    selectionHandleColor={ Colors.primary }
    { ...props }
  />
);

export default ThemedInputComponent;
