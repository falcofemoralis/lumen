import { withTV } from 'Hooks/withTV';

import ThemedButtonComponent from './ThemedButton.component';
import ThemedButtonComponentTV from './ThemedButton.component.atv';
import { ThemedButtonProps } from './ThemedButton.type';

export function ThemedButtonContainer(props: ThemedButtonProps) {
  return withTV(ThemedButtonComponentTV, ThemedButtonComponent, props);
}

export default ThemedButtonContainer;
