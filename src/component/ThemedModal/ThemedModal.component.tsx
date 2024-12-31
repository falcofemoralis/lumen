import { Modal, Portal } from 'react-native-paper';

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
        contentContainerStyle={ contentContainerStyle }
        style={ style }
      >
        { children }
      </Modal>
    </Portal>
  );
}
