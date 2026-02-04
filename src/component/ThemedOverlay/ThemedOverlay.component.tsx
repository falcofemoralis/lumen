import KeyboardAdjuster from 'Component/KeyboardAdjuster/KeyboardAdjuster.component';
import { Portal } from 'Component/ThemedPortal';
import { useLandscape } from 'Hooks/useLandscape';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { memo } from 'react';
import { Modal } from 'react-native';
import { GestureHandlerRootView, Pressable } from 'react-native-gesture-handler';
import { useAppTheme } from 'Theme/context';
import { noopFn } from 'Util/Function';

import { componentStyles } from './ThemedOverlay.style';
import { ThemedOverlayComponentProps } from './ThemedOverlay.type';

export function ThemedOverlayComponent({
  isOpened,
  contentContainerStyle,
  style,
  children,
  transparent,
  contentVisible,
  useKeyboardAdjustment,
  handleModalRequestClose,
  onShow,
}: ThemedOverlayComponentProps) {
  const { theme } = useAppTheme();
  const styles = useThemedStyles(componentStyles);
  const isLandscape = useLandscape();

  return (
    <Portal>
      <Modal
        animationType='fade'
        visible={ isOpened }
        onShow={ onShow }
        onRequestClose={ handleModalRequestClose }
        backdropColor={ theme.colors.modal }
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
            { useKeyboardAdjustment && <KeyboardAdjuster scale={ 2 } /> }
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
