import { Portal } from 'Component/ThemedPortal';
import { memo, useEffect, useId, useState } from 'react';
import { Modal, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { Colors } from 'Style/Colors';

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
  handleModalRequestClose,
}: ThemedOverlayComponentProps) {
  const id = useId();

  return (
    <Portal>
      <SpatialNavigationOverlay
        id={ id }
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
                { children }
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
  return prevProps.isOpened === props.isOpened && prevProps.isVisible === props.isVisible
    && prevProps.children === props.children;
}

export default memo(ThemedOverlayComponent, propsAreEqual);
