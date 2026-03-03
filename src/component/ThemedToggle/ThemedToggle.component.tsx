/* eslint-disable react/destructuring-assignment */
import { useThemedStyles } from 'Hooks/useThemedStyles';
import React, { ComponentType, useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  GestureResponderEvent,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewProps,
} from 'react-native';
import { useAppTheme } from 'Theme/context';
import { $styles } from 'Theme/styles';

import { componentStyles } from './ThemedToggle.style';
import { SwitchInputProps, SwitchToggleProps, ToggleProps } from './ThemedToggle.type';

export const ThemedToggleComponent = (props: SwitchToggleProps) => {
  const switchInput = useCallback(
    (toggleProps: SwitchInputProps) => (
      <SwitchInput { ...toggleProps } />
    ),
    []
  );

  return <Toggle accessibilityRole="switch" { ...props } ToggleInput={ switchInput } />;
};

function SwitchInput(props: SwitchInputProps) {
  const {
    on,
    status,
    disabled,
    outerStyle: $outerStyleOverride,
    innerStyle: $innerStyleOverride,
    detailStyle: $detailStyleOverride,
  } = props;

  const { theme: { colors } } = useAppTheme();
  const styles = useThemedStyles(componentStyles);

  const animate = useRef(new Animated.Value(on ? 1 : 0)); // Initial value is set based on isActive
  const opacity = useRef(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(animate.current, {
      toValue: on ? 1 : 0,
      duration: 300,
      useNativeDriver: true, // Enable native driver for smoother animations
    }).start();
  }, [on]);

  useEffect(() => {
    Animated.timing(opacity.current, {
      toValue: on ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [on]);

  const knobSizeFallback = 2;

  const knobWidth = [$detailStyleOverride?.width, styles.switchDetail?.width, knobSizeFallback].find(
    (v) => typeof v === 'number'
  );

  const knobHeight = [$detailStyleOverride?.height, styles.switchDetail?.height, knobSizeFallback].find(
    (v) => typeof v === 'number'
  );

  const offBackgroundColor = [
    disabled && colors.secondary,
    status === 'error' && colors.error,
    colors.backgroundLighter,
  ].filter(Boolean)[0];

  const onBackgroundColor = [
    disabled && colors.transparent,
    status === 'error' && colors.error,
    colors.primary,
  ].filter(Boolean)[0];

  const knobBackgroundColor = (function () {
    if (on) {
      return [
        $detailStyleOverride?.backgroundColor,
        status === 'error' && colors.error,
        disabled && colors.secondary,
        colors.icon,
      ].filter(Boolean)[0];
    }

    return [
      $innerStyleOverride?.backgroundColor,
      disabled && colors.secondary,
      status === 'error' && colors.error,
      colors.icon,
    ].filter(Boolean)[0];

  })();

  const $themedSwitchInner = useMemo(() => ({ ...styles.toggleInner, ...styles.switchInner }), [styles]);

  const offsetLeft = ($innerStyleOverride?.paddingStart ||
    $innerStyleOverride?.paddingLeft ||
    $themedSwitchInner?.paddingStart ||
    0) as number;

  const offsetRight = ($innerStyleOverride?.paddingEnd ||
    $innerStyleOverride?.paddingRight ||
    $themedSwitchInner?.paddingEnd ||
    0) as number;

  const outputRange = [offsetLeft, (+(knobWidth || 0) + offsetRight)];

  const $animatedSwitchKnob = animate.current.interpolate({
    inputRange: [0, 1],
    outputRange,
  });

  return (
    <View style={ [styles.inputOuter, { backgroundColor: offBackgroundColor }, $outerStyleOverride] }>
      <Animated.View
        style={ [
          $themedSwitchInner,
          { backgroundColor: onBackgroundColor },
          $innerStyleOverride,
          { opacity: opacity.current },
        ] }
      />

      <Animated.View
        style={ [
          styles.switchDetail,
          $detailStyleOverride,
          { transform: [{ translateX: $animatedSwitchKnob }] },
          { width: knobWidth, height: knobHeight },
          { backgroundColor: knobBackgroundColor },
        ] }
      />
    </View>
  );
}

/**
 * Renders a boolean input.
 * This is a controlled component that requires an onValueChange callback that updates the value prop in order for the component to reflect user actions. If the value prop is not updated, the component will continue to render the supplied value prop instead of the expected result of any user actions.
 * @param {ToggleProps} props - The props for the `Toggle` component.
 * @returns {JSX.Element} The rendered `Toggle` component.
 */
function Toggle<T>(props: ToggleProps<T>) {
  const {
    editable = true,
    status,
    value,
    onPress,
    onValueChange,
    containerStyle: $containerStyleOverride,
    inputWrapperStyle: $inputWrapperStyleOverride,
    ToggleInput,
    accessibilityRole,
    ...WrapperProps
  } = props;

  const styles = useThemedStyles(componentStyles);

  const disabled = editable === false || status === 'disabled' || props.disabled;

  const Wrapper = useMemo(
    () => (disabled ? View : TouchableOpacity) as ComponentType<TouchableOpacityProps | ViewProps>,
    [disabled]
  );

  const $containerStyles = [$containerStyleOverride];
  const $inputWrapperStyles = [$styles.row, styles.inputWrapper, $inputWrapperStyleOverride];

  /**
   * @param {GestureResponderEvent} e - The event object.
   */
  function handlePress(e: GestureResponderEvent) {
    if (disabled) return;
    onValueChange?.(!value);
    onPress?.(e);
  }

  return (
    <Wrapper
      activeOpacity={ 1 }
      accessibilityRole={ accessibilityRole }
      accessibilityState={ { checked: value, disabled } }
      { ...WrapperProps }
      style={ $containerStyles }
      onPress={ handlePress }
    >
      <View style={ $inputWrapperStyles }>
        <ToggleInput
          on={ !!value }
          disabled={ !!disabled }
          status={ status }
          outerStyle={ props.inputOuterStyle ?? {} }
          innerStyle={ props.inputInnerStyle ?? {} }
          detailStyle={ props.inputDetailStyle ?? {} }
        />
      </View>
    </Wrapper>
  );
}

export default ThemedToggleComponent;