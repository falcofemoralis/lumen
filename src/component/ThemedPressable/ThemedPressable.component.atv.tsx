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
      onSelect={ onPress }
      onLongSelect={ onLongPress }
      onFocus={ onFocus }
      onBlur={ onBlur }
    >
      { ({ isFocused, isRootActive }) => withAnimation ? (
        <Animated.View
          style={ [
            {
              transform: [{ scale: 1 }],
              transitionProperty: 'transform',
              transitionDuration: '250ms',
            },
            style,
            isFocused && isRootActive && {
              transform: [{ scale: zoomScale }],
            },
          ] }
        >
          { renderChildren({ isFocused, isRootActive }) }
        </Animated.View>
      ) : renderChildren({ isFocused, isRootActive }) }
    </SpatialNavigationFocusableView>
  );
};

export default ThemedPressableComponent;