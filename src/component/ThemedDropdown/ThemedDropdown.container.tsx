import { withTV } from 'Hooks/withTV';

import ThemedDropdownComponent from './ThemedDropdown.component';
import ThemedDropdownComponentTV from './ThemedDropdown.component.atv';
import { ThemedDropdownProps } from './ThemedDropdown.type';

export function ThemedDropdownContainer(props: ThemedDropdownProps) {
  return withTV(ThemedDropdownComponentTV, ThemedDropdownComponent, props);
}

export default ThemedDropdownContainer;
