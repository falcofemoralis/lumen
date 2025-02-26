import * as ScreenOrientation from 'expo-screen-orientation';
import { memo, useEffect, useState } from 'react';
import { Dimensions } from 'react-native';
import { Modal, Portal } from 'react-native-paper';

import { styles } from './ThemedOverlay.style';
import { ThemedOverlayComponentProps } from './ThemedOverlay.type';

export function ThemedOverlayComponent({
  isOpened,
  onHide,
  contentContainerStyle,
  style,
  children,
}: ThemedOverlayComponentProps) {
  const { height, width } = Dimensions.get('window');

  const [isLandscape, setIsLandscape] = useState(
    height < width,
  );

  useEffect(() => {
    const subscription = ScreenOrientation.addOrientationChangeListener(({ orientationInfo }) => {
      const { orientation: o } = orientationInfo;

      setIsLandscape(o === ScreenOrientation.Orientation.LANDSCAPE_LEFT
        || o === ScreenOrientation.Orientation.LANDSCAPE_RIGHT);
    });

    return () => {
      ScreenOrientation.removeOrientationChangeListener(subscription);
    };
  }, []);

  return (
    <Portal>
      <Modal
        visible={ isOpened }
        onDismiss={ onHide }
        contentContainerStyle={ [
          styles.contentContainerStyle,
          isLandscape && styles.contentContainerStyleLandscape,
          contentContainerStyle,
        ] }
        style={ [styles.modal, style] }
      >
        { children }
      </Modal>
    </Portal>
  );
}

function propsAreEqual(
  prevProps: ThemedOverlayComponentProps,
  props: ThemedOverlayComponentProps,
) {
  return prevProps.isOpened === props.isOpened && prevProps.isVisible === props.isVisible
    && prevProps.children === props.children;
}

export default memo(ThemedOverlayComponent, propsAreEqual);
