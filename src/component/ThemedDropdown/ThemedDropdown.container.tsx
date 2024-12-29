import { withTV } from 'Hooks/withTV';

import ThemedDropdownComponent from './ThemedDropdown.component';
import ThemedDropdownComponentTV from './ThemedDropdown.component.atv';
import { ThemedDropdownProps } from './ThemedDropdown.type';

/**
 * https://github.com/hoaphantn7604/react-native-element-dropdown#readme
 * @param props
 * @returns
 */
export function ThemedDropdownContainer(props: ThemedDropdownProps) {
  return withTV(ThemedDropdownComponentTV, ThemedDropdownComponent, props);
}

export default ThemedDropdownContainer;
