import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { TextInput } from 'react-native';
import { AvoidSoftInput } from 'react-native-avoid-softinput';
import { Colors } from 'Style/Colors';

import { styles } from './ThemedInput.style';
import { ThemedInputComponentProps } from './ThemedInput.type';

export const ThemedInputComponent = ({
  placeholder,
  onChangeText,
  useSoftInput = false,
  style,
  ...props
}: ThemedInputComponentProps) => {
  const onFocusEffect = useCallback(() => {
    // This should be run when screen gains focus - enable the module where it's needed
    if(useSoftInput) {
      AvoidSoftInput.setEnabled(true);
    }

    return () => {
      // This should be run when screen loses focus - disable the module where it's not needed, to make a cleanup
      if(useSoftInput) {
        AvoidSoftInput.setEnabled(false);
      }
    };
  }, [useSoftInput]);

  useFocusEffect(onFocusEffect); // register callback to focus events

  return (
    <TextInput
      placeholder={ placeholder }
      onChangeText={ onChangeText }
      style={ [
        styles.input,
        style,
      ] }
      placeholderTextColor={ Colors.text }
      selectionColor={ Colors.secondary }
      cursorColor={ Colors.secondary }
      underlineColorAndroid={ Colors.white }
      selectionHandleColor={ Colors.secondary }
      { ...props }
    />
  );
};

export default ThemedInputComponent;
