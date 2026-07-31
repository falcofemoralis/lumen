import { useFocusable } from '@noriginmedia/norigin-spatial-navigation-react-native-tvos';
import { ThemedPressable } from 'Component/ThemedPressable';
import { useOverlayContext } from 'Context/OverlayContext';
import { useDefaultFocus } from 'Hooks/useDefaultFocus';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import Eye from 'lucide-react-native/icons/eye';
import EyeOff from 'lucide-react-native/icons/eye-off';
import { trapRefGlobal } from 'Navigation/NativeFocusTrap';
import { useCallback, useEffect, useRef, useState } from 'react';
import { TextInput, View } from 'react-native';
import { useAppTheme } from 'Theme/context';

import { componentStyles } from './ThemedInput.style.atv';
import { ThemedInputComponentProps } from './ThemedInput.type';

export const ThemedInputComponent = ({
  placeholder,
  onChangeText,
  style,
  editable = true,
  autofocus,
  secureTextEntry,
  ref: propRef,
  focusKey,
  ...props
}: ThemedInputComponentProps) => {
  const { theme } = useAppTheme();
  const styles = useThemedStyles(componentStyles);
  const inputRef = useRef<TextInput>(null);
  const { isOverlayOpen } = useOverlayContext();
  const inputBlurredRef = useRef(false);
  const isFocusedRef = useRef(false);
  const textInputRef = propRef ?? inputRef;
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const onEnterPress = useCallback(() => {
    if (!editable) {
      return;
    }

    setTimeout(() => {
      const input = textInputRef.current;

      if (!input) {
        return;
      }

      // `focus()` is a no-op whenever React Native already believes this field is
      // focused, and Android hands the EditText native focus behind our back: the
      // Norigin adapter calls `requestTVFocus()` on every node it focuses, and a
      // plain View is not natively focusable, so Android forwards that request to
      // its first focusable descendant -- the EditText -- which reports focus to
      // JS without anyone ever opening the IME. Dropping that stale focus first is
      // what makes the request reach native and raise the keyboard.
      if (TextInput.State.currentlyFocusedInput() === input) {
        input.blur();
      }

      input.focus();
    }, 100);
  }, [editable, textInputRef]);

  const onBlur = useCallback(() => {
    if (!editable) {
      return;
    }

    if (trapRefGlobal) {
      trapRefGlobal.current?.requestTVFocus();
    }

    setTimeout(() => {
      textInputRef.current?.blur();
    }, 100);
  }, [editable, textInputRef]);

  const { ref, focused, focusKey: realFocusKey } = useFocusable({
    focusKey,
    onEnterPress,
    onBlur,
  });

  useDefaultFocus(realFocusKey, !!autofocus);

  // Mirrors the spatial focus into a ref so the overlay effect below can read it
  // without re-running on every focus change.
  useEffect(() => {
    isFocusedRef.current = focused;
  }, [focused]);

  useEffect(() => {
    if (!isOverlayOpen && isFocusedRef.current) {
      onBlur();

      inputBlurredRef.current = true;
    }

    if (isOverlayOpen && inputBlurredRef.current) {
      inputBlurredRef.current = false;

      onEnterPress();
    };
  }, [isOverlayOpen, onBlur, onEnterPress]);

  const renderInput = () => {
    return (
      // `focusable` keeps the node the Norigin adapter targets with
      // `requestTVFocus()` natively focusable, so Android stops at this wrapper
      // instead of forwarding the request down to the EditText. Without it the
      // input silently holds native focus with no keyboard, and the next
      // `focus()` call is swallowed as a redundant one.
      <View ref={ ref } focusable style={ styles.inputContainer }>
        <TextInput
          autoComplete="off"
          ref={ textInputRef }
          editable={ editable }
          placeholder={ placeholder }
          onChangeText={ onChangeText }
          style={ [
            styles.input,
            style,
            focused && styles.inputFocus,
          ] }
          placeholderTextColor={ focused ? theme.colors.textFocused : theme.colors.text }
          selectionColor={ theme.colors.primary }
          cursorColor={ theme.colors.primary }
          underlineColorAndroid={ theme.colors.transparent }
          selectionHandleColor={ theme.colors.primary }
          secureTextEntry={ secureTextEntry ? !isPasswordVisible : false }
          { ...props }
        />
      </View>
    );
  };

  const renderSecureIcon = () => {
    if (!secureTextEntry) {
      return null;
    }

    return (
      <ThemedPressable
        style={ styles.secureIcon }
        onPress={ () => setIsPasswordVisible(!isPasswordVisible) }
      >
        { ({ isFocused }) => (
          <View
            style={ [
              styles.secureIconInner,
              isFocused && styles.secureIconFocused,
            ] }
          >
            { isPasswordVisible ? (
              <EyeOff
                color={ isFocused ? theme.colors.iconFocused : theme.colors.icon }
              />
            ) : (
              <Eye
                color={ isFocused ? theme.colors.iconFocused : theme.colors.icon }
              />
            ) }
          </View>
        ) }
      </ThemedPressable>
    );
  };

  return (
    <View style={ styles.wrapper }>
      { renderInput() }
      { renderSecureIcon() }
    </View>
  );
};

export default ThemedInputComponent;
