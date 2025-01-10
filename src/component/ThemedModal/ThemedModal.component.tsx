import { Modal, Portal } from 'react-native-paper';

import { styles } from './ThemedModal.style';
import { ThemedModalComponentProps } from './ThemedModal.type';

export default function ThemedModalComponent({
  isVisible,
  onHide,
  contentContainerStyle,
  style,
  children,
}: ThemedModalComponentProps) {
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
