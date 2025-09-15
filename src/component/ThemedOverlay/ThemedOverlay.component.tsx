import { Portal } from 'Component/ThemedPortal';
import { useGradualAnimation } from 'Hooks/useGradualAnimation';
import { useLandscape } from 'Hooks/useLandscape';
import {
  memo,
} from 'react';
import { Modal } from 'react-native';
import { GestureHandlerRootView, Pressable } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { Colors } from 'Style/Colors';
import { noopFn } from 'Util/Function';

import { styles } from './ThemedOverlay.style';
import { ThemedOverlayComponentProps } from './ThemedOverlay.type';

export function ThemedOverlayComponent({
  isOpened,
  contentContainerStyle,
  style,
  children,
  transparent,
  contentVisible,
  handleModalRequestClose,
  onShow,
}: ThemedOverlayComponentProps) {
  const isLandscape = useLandscape();
  const { height } = useGradualAnimation();

  const keyboardPadding = useAnimatedStyle(() => {
    return {
      height: height.value > 0 ? height.value / 2 : 0,
    };
  }, []);

  return (
    <Portal>
      <Modal
        animationType='fade'
        visible={ isOpened }
        onShow={ onShow }
        onRequestClose={ handleModalRequestClose }
        backdropColor={ Colors.modal }
        transparent={ transparent }
      >
        <GestureHandlerRootView>
          <Pressable
            onPress={ handleModalRequestClose }
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
              { contentVisible && children }
            </Pressable>
            <Animated.View style={ keyboardPadding } />
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
    && prevProps.children === props.children;
}

export default memo(ThemedOverlayComponent, propsAreEqual);
