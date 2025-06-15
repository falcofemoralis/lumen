import { Portal } from 'Component/ThemedPortal';
import {
  memo,
  useEffect,
  useState,
} from 'react';
import { useWindowDimensions, View } from 'react-native';
import Modal from 'react-native-modal';

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
  const { width, height } = useWindowDimensions();

  useEffect(() => {
    const newLandscape = width > height;

    if (newLandscape !== isLandscape) {
      setIsLandscape(newLandscape);
    }
  }, [width, height]);

  return (
    <Portal>
      <Modal
        isVisible={ isOpened }
        onModalHide={ onHide }
        animationIn='fadeIn'
        animationOut='fadeOut'
        onBackButtonPress={ onHide }
        onBackdropPress={ onHide }
        coverScreen={ false }
        useNativeDriver
        useNativeDriverForBackdrop
        hideModalContentWhileAnimating
      >
        <View
          style={ [
            styles.contentContainerStyle,
            isLandscape && styles.contentContainerStyleLandscape,
            contentContainerStyle,
          ] }
        >
          { children }
        </View>
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
