import { Portal } from 'Component/ThemedPortal';
import { memo } from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';

import { SpatialNavigationOverlay } from './SpatialNavigationOverlay';
import { styles } from './ThemedOverlay.style.atv';
import { ThemedOverlayComponentProps } from './ThemedOverlay.type';

export function ThemedOverlayComponent({
  style,
  containerStyle,
  contentContainerStyle,
  children,
  isOpened,
  isVisible,
  contentVisible,
  handleModalRequestClose,
}: ThemedOverlayComponentProps) {
  return (
    <Portal>
      <SpatialNavigationOverlay
        isModalOpened={ isOpened }
        isModalVisible={ isOpened && isVisible }
        hideModal={ handleModalRequestClose }
      >
        <Portal.Host>
          <Animated.View
            style={ [
              styles.modal,
              style,
              isVisible && styles.modalVisible,
            ] }
          >
            <View style={ [styles.container, containerStyle] }>
              <View style={ [styles.contentContainer, contentContainerStyle] }>
                { contentVisible && children }
              </View>
            </View>
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
    && prevProps.isVisible === props.isVisible
    && prevProps.children === props.children;
}

export default memo(ThemedOverlayComponent, propsAreEqual);
