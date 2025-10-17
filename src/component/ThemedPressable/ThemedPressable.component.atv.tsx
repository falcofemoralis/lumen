import Animated from 'react-native-reanimated';
import { SpatialNavigationFocusableView } from 'react-tv-space-navigation';

import { styles } from './ThemedPressable.style.atv';
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
  mode = 'light',
  pressDelay = 50,
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
            styles.item,
            style,
            isFocused && {
              transform: [{ scale: zoomScale }],
            },
          ] }
        >
          { typeof children === 'function' ? children({ isFocused, isRootActive }) : children }
        </Animated.View>
      ) : renderChildren({ isFocused, isRootActive }) }
    </SpatialNavigationFocusableView>
  );
};

export default ThemedPressableComponent;