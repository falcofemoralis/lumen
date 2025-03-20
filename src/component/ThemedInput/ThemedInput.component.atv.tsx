import { useRef } from 'react';
import { TextInput } from 'react-native-paper';
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
  const textInputRef = useRef<any>();

  return (
    <SpatialNavigationFocusableView
      onSelect={ () => textInputRef.current?.focus() }
    >
      { ({ isFocused }) => (
        <TextInput
          autoComplete="off"
          ref={ textInputRef }
          mode="flat"
          placeholder={ placeholder }
          onChangeText={ onChangeText }
          style={ [
            styles.input,
            style,
            isFocused && styles.inputFocus,
          ] }
          placeholderTextColor={ isFocused ? Colors.black : Colors.white }
          textColor={ isFocused ? Colors.black : Colors.white }
          selectionColor={ Colors.primary }
          underlineColor={ Colors.primary }
          outlineColor={ Colors.primary }
          activeOutlineColor={ Colors.secondary }
          cursorColor={ Colors.primary }
          underlineColorAndroid={ Colors.white }
          activeUnderlineColor={ Colors.secondary }
          selectionHandleColor={ Colors.primary }
          { ...props }
        />
      ) }
    </SpatialNavigationFocusableView>
  );
};

export default ThemedInputComponent;
