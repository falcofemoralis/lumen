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
  const renderChildren = (state: ThemedFocusableNodeState): React.ReactElement => {
    if (typeof children === 'function') {
      return children(state);
    }

    return children as React.ReactElement;
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
          { renderChildren({ isFocused, isRootActive }) }
        </Animated.View>
      ) : renderChildren({ isFocused, isRootActive }) }
    </SpatialNavigationFocusableView>
  );
};

export default ThemedPressableComponent;