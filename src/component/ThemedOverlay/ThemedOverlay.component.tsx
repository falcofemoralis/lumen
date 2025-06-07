import { Portal } from 'Component/ThemedPortal';
import {
  memo,
  useEffect,
  useState,
} from 'react';
import { Dimensions, Modal, Pressable, ScaledSize } from 'react-native';
import { Colors } from 'Style/Colors';
import { noopFn } from 'Util/Function';

import { styles } from './ThemedOverlay.style';
import { ThemedOverlayComponentProps } from './ThemedOverlay.type';

export function ThemedOverlayComponent({
  isOpened,
  onHide,
  contentContainerStyle,
  style,
  children,
}: ThemedOverlayComponentProps) {
  const [isLandscape, setIsLandscape] = useState(false);

  const updateOrientation = (args?: { window: ScaledSize }) => {
    const { window } = args ?? {};
    const { width, height } = window ?? Dimensions.get('window');
    const newLandscape = width > height;

    setIsLandscape(newLandscape);
  };

  useEffect(() => {
    const dimensionChangeHandler = Dimensions.addEventListener('change', updateOrientation);

    return () => {
      dimensionChangeHandler.remove();
    };
  }, []);

  useEffect(() => {
    if (isOpened) {
      updateOrientation();
    }
  }, [isOpened]);

  return (
    <Portal>
      <Modal
        animationType='fade'
        visible={ isOpened }
        onRequestClose={ onHide }
        backdropColor={ Colors.modal }
      >
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
