import ThemedPressable from 'Component/ThemedPressable';
import { useCallback, useRef } from 'react';
import { TextInput } from 'react-native';
import { Colors } from 'Style/Colors';

import { styles } from './ThemedInput.style.atv';
import { ThemedInputComponentProps } from './ThemedInput.type';

export const ThemedInputComponent = ({
  placeholder,
  onChangeText,
  style,
  editable = true,
  withAnimation = false,
  ...props
}: ThemedInputComponentProps) => {
  const textInputRef = useRef<TextInput>(null);

  const onSelect = useCallback(() => {
    if (!editable) {
      return;
    }

    setTimeout(() => {
      // this fixes issue with unfocus on new arch
      textInputRef.current?.focus();
    }, 100);
  }, [editable]);

  return (
    <ThemedPressable
      onPress={ onSelect }
      onFocus={ onSelect }
      withAnimation={ withAnimation }
    >
      { ({ isFocused }) => (
        <TextInput
          autoComplete="off"
          ref={ textInputRef }
          placeholder={ placeholder }
          onChangeText={ onChangeText }
          style={ [
            styles.input,
            style,
            isFocused && styles.inputFocus,
          ] }
          placeholderTextColor={ isFocused ? Colors.textFocused : Colors.text }
          selectionColor={ Colors.primary }
          cursorColor={ Colors.primary }
          underlineColorAndroid={ Colors.transparent }
          selectionHandleColor={ Colors.primary }
          tvFocusable={ false }
          focusable={ false }
          editable={ editable }
          { ...props }
        />
      ) }
    </ThemedPressable>
  );
};

export default ThemedInputComponent;
