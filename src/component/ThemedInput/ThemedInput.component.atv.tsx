import { useRef } from 'react';
import { TextInput } from 'react-native';
import { SpatialNavigationFocusableView } from 'react-tv-space-navigation';
import Colors from 'Style/Colors';

import { styles } from './ThemedInput.style.atv';
import { ThemedInputComponentProps } from './ThemedInput.type';

export const ThemedInputComponent = ({
  placeholder,
  onChangeText,
  style,
  ...props
}: ThemedInputComponentProps) => {
  const textInputRef = useRef<any>(null);

  const focusInput = () => {
    textInputRef.current?.focus();

    setTimeout(() => {
      // this fixes issue with unfocus on new arch
      textInputRef.current?.focus();
    }, 100);
  };

  return (
    <SpatialNavigationFocusableView
      onSelect={ focusInput }
    >
      { ({ isFocused }) => (
        <TextInput
          autoComplete="off"
          ref={ textInputRef }
          tvFocusable
          placeholder={ placeholder }
          onChangeText={ onChangeText }
          style={ [
            styles.input,
            style,
            isFocused && styles.inputFocus,
          ] }
          placeholderTextColor={ isFocused ? Colors.black : Colors.white }
          selectionColor={ Colors.primary }
          cursorColor={ Colors.primary }
          underlineColorAndroid={ Colors.white }
          selectionHandleColor={ Colors.primary }
          { ...props }
        />
      ) }
    </SpatialNavigationFocusableView>
  );
};

export default ThemedInputComponent;
