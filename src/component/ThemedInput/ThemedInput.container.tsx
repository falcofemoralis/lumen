import { withTV } from 'Hooks/withTV';

import ThemedInputComponent from './ThemedInput.component';
import ThemedInputComponentTV from './ThemedInput.component.atv';
import { ThemedInputContainerProps } from './ThemedInput.type';

export function ThemedInputContainer(props: ThemedInputContainerProps) {
  return withTV(ThemedInputComponentTV, ThemedInputComponent, props);
}

export default ThemedInputContainer;
