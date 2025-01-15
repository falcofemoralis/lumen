import { Modal, Portal } from 'react-native-paper';

import { styles } from './ThemedOverlay.style';
import { ThemedOverlayComponentProps } from './ThemedOverlay.type';

export default function ThemedOverlayComponent({
  isVisible,
  onHide,
  contentContainerStyle,
  style,
  children,
}: ThemedOverlayComponentProps) {
  return (
    <Portal>
      <Modal
        visible={ isVisible }
        onDismiss={ onHide }
        contentContainerStyle={ [styles.contentContainerStyle, contentContainerStyle] }
        style={ [styles.modal, style] }
      >
        { children }
      </Modal>
    </Portal>
  );
}
