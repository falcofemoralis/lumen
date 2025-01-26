import * as ScreenOrientation from 'expo-screen-orientation';
import { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';
import { Modal, Portal } from 'react-native-paper';

import { styles } from './ThemedOverlay.style';
import { ThemedOverlayComponentProps } from './ThemedOverlay.type';

const window = Dimensions.get('window');

export function ThemedOverlayComponent({
  isOpened,
  onHide,
  contentContainerStyle,
  style,
  children,
}: ThemedOverlayComponentProps) {
  const [isLandscape, setIsLandscape] = useState(
    window.height < window.width,
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

export default ThemedOverlayComponent;
