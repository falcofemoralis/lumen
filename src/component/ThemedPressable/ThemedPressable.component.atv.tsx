import { Pressable } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { SpatialNavigationFocusableView } from 'react-tv-space-navigation';

import { ThemedFocusableNodeState, ThemedPressableComponentProps } from './ThemedPressable.type';

export const ThemedPressableComponent = ({
  onPress,
  onLongPress,
  onFocus,
  onBlur,
  children,
  style,
  contentStyle,
  spatialRef,
  disabled = false,
  withAnimation = false,
  zoomScale = 1.05,
}: ThemedPressableComponentProps) => {
  const renderChildren = (state: ThemedFocusableNodeState) => {
    if (typeof children === 'function') {
      return children(state);
    }

    return children as React.ReactElement;
  };

  const renderPressableWrapper = (state: ThemedFocusableNodeState) => {
    return (
      <Pressable
        onPress={ onPress }
        onLongPress={ onLongPress }
        disabled={ disabled }
        focusable={ false }
      >
        { renderChildren(state) }
      </Pressable>
    );
  };

  return (
    <SpatialNavigationFocusableView
      ref={ spatialRef }
      onSelect={ disabled ? undefined : onPress }
      onLongSelect={ disabled ? undefined : onLongPress }
      onFocus={ onFocus }
      onBlur={ onBlur }
      style={ style }
    >
      { ({ isFocused, isRootActive }) => withAnimation ? (
        <Animated.View
          style={ [
            {
              transform: [{ scale: 1 }],
              transitionProperty: 'transform',
              transitionDuration: '250ms',
            },
            contentStyle,
            isFocused && isRootActive && {
              transform: [{ scale: zoomScale }],
            },
            disabled && { opacity: 0.5 },
          ] }
        >
          { renderPressableWrapper({ isFocused, isRootActive }) }
        </Animated.View>
      ) : renderPressableWrapper({ isFocused, isRootActive }) }
    </SpatialNavigationFocusableView>
  );
};

export default ThemedPressableComponent;