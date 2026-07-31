import { useFocusable } from '@noriginmedia/norigin-spatial-navigation-react-native-tvos';
import { useScrollContext } from 'Component/ThemedScrollView/ScrollContext';
import { useDefaultFocus } from 'Hooks/useDefaultFocus';
import { useLongEnterPress } from 'Hooks/useLongEnterPress';
import { ReactElement } from 'react';
import { View } from 'react-native';
import { Pressable } from 'react-native-gesture-handler';
import { useAppTheme } from 'Theme/context';

import { ThemedFocusableNodeState, ThemedPressableComponentProps } from './ThemedPressable.type';

export const ThemedPressableComponent = ({
  onPress,
  onLongPress,
  onFocus,
  onBlur,
  onEnterPress,
  children,
  style,
  contentStyle,
  disabled,
  mode = 'light',
  pressDelay = 50,
  topAdditionalElement,
  bottomAdditionalElement,
  extraProps,
  focusKey,
  autofocus,
}: ThemedPressableComponentProps) => {
  const { scrollTo } = useScrollContext();
  const { theme } = useAppTheme();
  const { ref, focused, focusKey: realFocusKey } = useFocusable({
    focusKey,
    onFocus: (layout, props, details) => {
      onFocus?.();
      scrollTo?.(layout, props, details);
    },
    onBlur,
    extraProps,
    onEnterPress: onEnterPress ?? onPress,
  });

  useDefaultFocus(realFocusKey, !!autofocus);

  // `Pressable.onLongPress` only covers air-mouse/touch presses -- this adds the
  // same behavior for holding the d-pad OK button while this node is focused.
  useLongEnterPress(onLongPress, focused && !disabled);

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

    if (typeof children === 'function') {
      return topAdditionalElement(state);
    }

    return children as ReactElement;
  };

  const renderBottomAdditionalElement = (state: ThemedFocusableNodeState): ReactElement|null => {
    if (!bottomAdditionalElement) {
      return null;
    }

    if (typeof children === 'function') {
      return bottomAdditionalElement(state);
    }

    return children as ReactElement;
  };

  const state = { isFocused: focused };

  return (
    <View style={ [typeof style === 'function' ? style(state) : style, { overflow: 'hidden' }] }>
      <Pressable
        ref={ ref }
        onPress={ onPress }
        onLongPress={ onLongPress }
        disabled={ disabled }
        android_ripple={ {
          color: mode === 'light' ? theme.colors.pressableHighlight : theme.colors.pressableHighlightOpposite,
        } }
        unstable_pressDelay={ pressDelay }
        style={ [{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
        }, typeof contentStyle === 'function' ? contentStyle(state) : contentStyle] }
        tvFocusable={ false }
        focusable={ false }
      >
        { renderTopAdditionalElement(state) }
        { renderChildren(state) }
        { renderBottomAdditionalElement(state) }
      </Pressable>
    </View>
  );
};

export default ThemedPressableComponent;