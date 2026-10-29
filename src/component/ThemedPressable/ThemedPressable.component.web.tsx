import { ReactElement, useState } from 'react';
import { View, Pressable } from 'react-native';

import { useAppTheme } from 'Theme/context';

import { ThemedFocusableNodeState, ThemedPressableComponentProps } from './ThemedPressable.type';

export const ThemedPressableComponent = ({
  onPress,
  onLongPress,
  children,
  ref,
  style,
  contentStyle,
  disabled,
  accessibilityRole,
  mode = 'light',
  pressDelay = 50,
  disableRipple = false,
  topAdditionalElement,
  bottomAdditionalElement,
}: ThemedPressableComponentProps) => {
  const { theme } = useAppTheme();

  const renderChildren = (state: ThemedFocusableNodeState): ReactElement => {
    if (typeof children === 'function') {
      return children(state);
    }

    return children as ReactElement;
  };

  const renderTopAdditionalElement = (state: ThemedFocusableNodeState): ReactElement|null => {
    if (!topAdditionalElement) {
      return null;
    }

    return topAdditionalElement(state);
  };

  const renderBottomAdditionalElement = (state: ThemedFocusableNodeState): ReactElement|null => {
    if (!bottomAdditionalElement) {
      return null;
    }

    return bottomAdditionalElement(state);
  };

  const [isFocused, setIsFocused] = useState(false);
  const state = { isFocused };

  return (
    <View style={ [typeof style === 'function' ? style(state) : style, { overflow: 'hidden' }] }>
      { renderTopAdditionalElement(state) }
      <Pressable
        ref={ ref }
        onPress={ onPress }
        onLongPress={ onLongPress }
        disabled={ disabled }
        accessibilityRole={ accessibilityRole ?? 'button' }
        onFocus={ () => setIsFocused(true) }
        onBlur={ () => setIsFocused(false) }
        android_ripple={ disableRipple ? null : {
          color: mode === 'light' ? theme.colors.pressableHighlight : theme.colors.pressableHighlightOpposite,
        } }

        style={ [{
          flexGrow: 1,
          flexShrink: 1,
          flexBasis: 'auto',
          alignSelf: 'stretch',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
        }, typeof contentStyle === 'function' ? contentStyle(state) : contentStyle] }
        tvFocusable={ false }
        focusable={ !disabled }
      >
        { renderChildren(state) }
        { renderBottomAdditionalElement(state) }
      </Pressable>
    </View>
  );
};

export default ThemedPressableComponent;
