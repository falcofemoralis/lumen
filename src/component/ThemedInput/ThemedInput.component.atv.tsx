import { ThemedPressable } from 'Component/ThemedPressable';
import { useOverlayContext } from 'Context/OverlayContext';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { Eye, EyeOff } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { TextInput, View } from 'react-native';
import { SpatialNavigationView } from 'react-tv-space-navigation';
import { useAppTheme } from 'Theme/context';

import { componentStyles } from './ThemedInput.style.atv';
import { ThemedInputComponentProps } from './ThemedInput.type';

export const ThemedInputComponent = ({
  placeholder,
  onChangeText,
  style,
  editable = true,
  withAnimation = false,
  ref,
  secureTextEntry = false,
  ...props
}: ThemedInputComponentProps) => {
  const { theme } = useAppTheme();
  const styles = useThemedStyles(componentStyles);
  const inputRef = useRef<TextInput>(null);
  const { isOverlayOpen } = useOverlayContext();
  const inputBlurredRef = useRef(false);
  const isFocusedRef = useRef(false);
  const textInputRef = ref ?? inputRef;
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

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

  const renderSecureIcon = () => {
    if (!secureTextEntry) {
      return null;
    }

    return (
      <ThemedPressable
        style={ styles.secureIcon }
        onPress={ () => setIsPasswordVisible(!isPasswordVisible) }
        withAnimation
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
    <SpatialNavigationView
      direction="horizontal"
      style={ styles.wrapper }
    >
      <ThemedPressable
        onPress={ onSelect }
        onFocus={ onSelect }
        onBlur={ onBlur }
        withAnimation={ withAnimation }
        style={ styles.inputPressable }
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
              secureTextEntry={ secureTextEntry ? !isPasswordVisible : false }
              { ...props }
            />
          );
        } }
      </ThemedPressable>
      { renderSecureIcon() }
    </SpatialNavigationView>
  );
};

export default ThemedInputComponent;
