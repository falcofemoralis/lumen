import { withTV } from 'Hooks/withTV';

import ThemedModalComponent from './ThemedModal.component';
import ThemedModalComponentTV from './ThemedModal.component.atv';
import { ThemedModalProps } from './ThemedModal.type';

export function ThemedModalContainer(props: ThemedModalProps) {
  return withTV(ThemedModalComponentTV, ThemedModalComponent, props);
}

export default ThemedModalContainer;
