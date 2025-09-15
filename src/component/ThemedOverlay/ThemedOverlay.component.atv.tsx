import { Portal } from 'Component/ThemedPortal';
import { useGradualAnimation } from 'Hooks/useGradualAnimation';
import { memo } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { SpatialNavigationOverlay } from './SpatialNavigationOverlay';
import { styles } from './ThemedOverlay.style.atv';
import { ThemedOverlayComponentProps } from './ThemedOverlay.type';

export function ThemedOverlayComponent({
  style,
  containerStyle,
  contentContainerStyle,
  children,
  isOpened,
  contentVisible,
  handleModalRequestClose,
}: ThemedOverlayComponentProps) {
  const { height } = useGradualAnimation();

  const keyboardPadding = useAnimatedStyle(() => {
    return {
      height: height.value > 0 ? height.value / 2 : 0,
    };
  }, []);

  return (
    <Portal>
      <SpatialNavigationOverlay
        isModalOpened={ isOpened }
        isModalVisible={ isOpened }
        hideModal={ handleModalRequestClose }
      >
        <Portal.Host>
          <Animated.View
            style={ [
              styles.modal,
              style,
              isOpened && styles.modalVisible,
            ] }
          >
            <View style={ [styles.container, containerStyle] }>
              <View style={ [styles.contentContainer, contentContainerStyle] }>
                { contentVisible && children }
              </View>
            </View>
            <Animated.View style={ keyboardPadding } />
          </Animated.View>
        </Portal.Host>
      </SpatialNavigationOverlay>
    </Portal>
  );
}

function propsAreEqual(
  prevProps: ThemedOverlayComponentProps,
  props: ThemedOverlayComponentProps
) {
  return prevProps.isOpened === props.isOpened
    && prevProps.children === props.children;
}

export default memo(ThemedOverlayComponent, propsAreEqual);
