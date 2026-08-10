import { ReactElement } from 'react';
import { View } from 'react-native';
import { Pressable } from 'react-native-gesture-handler';
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
  mode = 'light',
  pressDelay = 50,
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

  const state = { isFocused: false };

  return (
    <View style={ [typeof style === 'function' ? style(state) : style, { overflow: 'hidden' }] }>
      { renderTopAdditionalElement(state) }
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
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
        }, typeof contentStyle === 'function' ? contentStyle(state) : contentStyle] }
        tvFocusable={ false }
        focusable={ false }
      >
        { renderChildren(state) }
        { renderBottomAdditionalElement(state) }
      </Pressable>
    </View>
  );
};

export default ThemedPressableComponent;