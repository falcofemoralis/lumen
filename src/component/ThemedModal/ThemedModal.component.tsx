import { Modal, Portal } from 'react-native-paper';

import { ThemedModalProps } from './ThemedModal.type';

export default function ThemedModalComponent({
  visible,
  onHide,
  contentContainerStyle,
  style,
  children,
}: ThemedModalProps) {
  return (
    <Portal>
      <Modal
        visible={ visible }
        onDismiss={ onHide }
        contentContainerStyle={ contentContainerStyle }
        style={ style }
      >
        { children }
      </Modal>
    </Portal>
  );
}
