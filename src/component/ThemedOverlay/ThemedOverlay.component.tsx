import { Portal } from 'Component/ThemedPortal';
import { useLandscape } from 'Hooks/useLandscape';
import {
  memo,
} from 'react';
import { Modal } from 'react-native';
import { GestureHandlerRootView, Pressable } from 'react-native-gesture-handler';
import { Colors } from 'Style/Colors';
import { noopFn } from 'Util/Function';

import { styles } from './ThemedOverlay.style';
import { ThemedOverlayComponentProps } from './ThemedOverlay.type';

/**
 * TODO: Replace modal with react-native-modal once it will be stable
 */
export function ThemedOverlayComponent({
  isOpened,
  onHide,
  contentContainerStyle,
  style,
  children,
  transparent,
}: ThemedOverlayComponentProps) {
  const isLandscape = useLandscape();

  return (
    <Portal>
      <Modal
        animationType='fade'
        visible={ isOpened }
        onRequestClose={ onHide }
        backdropColor={ Colors.modal }
        transparent={ transparent }
      >
        <GestureHandlerRootView>
          <Pressable
            onPress={ onHide }
            style={ [styles.modal, style] }
          >
            <Pressable
              onPress={ noopFn }
              style={ [
                styles.contentContainerStyle,
                isLandscape && styles.contentContainerStyleLandscape,
                contentContainerStyle,
              ] }
            >
              { children }
            </Pressable>
          </Pressable>
        </GestureHandlerRootView>
      </Modal>
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
