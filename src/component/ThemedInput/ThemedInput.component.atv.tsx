import { ThemedPressable } from 'Component/ThemedPressable';
import { useOverlayContext } from 'Context/OverlayContext';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { useCallback, useEffect, useRef } from 'react';
import { TextInput } from 'react-native';
import { useAppTheme } from 'Theme/context';

import { componentStyles } from './ThemedInput.style.atv';
import { ThemedInputComponentProps } from './ThemedInput.type';

export const ThemedInputComponent = ({
  placeholder,
  onChangeText,
  style,
  editable = true,
  withAnimation = false,
  ...props
}: ThemedInputComponentProps) => {
  const { theme } = useAppTheme();
  const styles = useThemedStyles(componentStyles);
  const textInputRef = useRef<TextInput>(null);
  const { isOverlayOpen } = useOverlayContext();
  const inputBlurredRef = useRef(false);
  const isFocusedRef = useRef(false);

  const onSelect = useCallback(() => {
    if (!editable) {
      return;
    }

    textInputRef.current?.setNativeProps({ editable: true });

    setTimeout(() => {
      textInputRef.current?.focus();
    }, 100);
  }, [editable]);

  const onBlur = useCallback(() => {
    if (!editable) {
      return;
    }

    textInputRef.current?.setNativeProps({ editable: false });

    setTimeout(() => {
      textInputRef.current?.blur();
    }, 100);
  }, [editable]);

  useEffect(() => {
    if (!isOverlayOpen && isFocusedRef.current) {
      onBlur();

      inputBlurredRef.current = true;
    }

    if (isOverlayOpen && inputBlurredRef.current) {
      inputBlurredRef.current = false;

      onSelect();
    };
  }, [isOverlayOpen, onBlur, onSelect]);

  return (
    <ThemedPressable
      onPress={ onSelect }
      onFocus={ onSelect }
      onBlur={ onBlur }
      withAnimation={ withAnimation }
    >
      { ({ isFocused, isRootActive }) => {
        isFocusedRef.current = isFocused;

        return (
          <TextInput
            autoComplete="off"
            ref={ textInputRef }
            placeholder={ placeholder }
            onChangeText={ onChangeText }
            style={ [
              styles.input,
              style,
              isFocused && isRootActive && styles.inputFocus,
            ] }
            placeholderTextColor={ isFocused && isRootActive? theme.colors.textFocused : theme.colors.text }
            selectionColor={ theme.colors.primary }
            cursorColor={ theme.colors.primary }
            underlineColorAndroid={ theme.colors.transparent }
            selectionHandleColor={ theme.colors.primary }
            tvFocusable={ false }
            focusable={ false }
            editable={ false }
            { ...props }
          />
        );
      } }
    </ThemedPressable>
  );
};

export default ThemedInputComponent;
