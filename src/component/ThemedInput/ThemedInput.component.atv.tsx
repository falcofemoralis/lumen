import { useCallback, useRef } from 'react';
import { TextInput } from 'react-native';
import { SpatialNavigationFocusableView } from 'react-tv-space-navigation';
import { Colors } from 'Style/Colors';

import { styles } from './ThemedInput.style.atv';
import { ThemedInputComponentProps } from './ThemedInput.type';

export const ThemedInputComponent = ({
  placeholder,
  onChangeText,
  style,
  ...props
}: ThemedInputComponentProps) => {
  const textInputRef = useRef<TextInput>(null);

  const onSelect = useCallback(() => {
    textInputRef.current?.focus();

    setTimeout(() => {
      // this fixes issue with unfocus on new arch
      textInputRef.current?.focus();
    }, 100);
  }, []);

  return (
    <SpatialNavigationFocusableView
      onSelect={ onSelect }
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
          { ...props }
        />
      ) }
    </SpatialNavigationFocusableView>
  );
};

export default ThemedInputComponent;
