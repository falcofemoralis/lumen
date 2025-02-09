import { TextInput } from 'react-native-paper';

import { ThemedInputComponentProps } from './ThemedInput.type';

export const ThemedInputComponent = ({
  placeholder,
  onChangeText,
  style,
  ...props
}: ThemedInputComponentProps) => (
  <TextInput
    placeholder={ placeholder }
    onChangeText={ onChangeText }
    style={ style }
    { ...props }
  />
);

export default ThemedInputComponent;
