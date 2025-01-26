import { withTV } from 'Hooks/withTV';

import ThemedDropdownComponent from './ThemedDropdown.component';
import ThemedDropdownComponentTV from './ThemedDropdown.component.atv';
import { ThemedDropdownContainerProps } from './ThemedDropdown.type';

export function ThemedDropdownContainer(props: ThemedDropdownContainerProps<any>) {
  return withTV(ThemedDropdownComponentTV, ThemedDropdownComponent, props);
}

export default ThemedDropdownContainer;
