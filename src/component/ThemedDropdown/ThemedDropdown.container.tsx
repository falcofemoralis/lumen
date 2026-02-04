import { useConfigContext } from 'Context/ConfigContext';

import ThemedDropdownComponent from './ThemedDropdown.component';
import ThemedDropdownComponentTV from './ThemedDropdown.component.atv';
import { ThemedDropdownContainerProps } from './ThemedDropdown.type';

export function ThemedDropdownContainer(props: ThemedDropdownContainerProps) {
  const { isTV } = useConfigContext();

  return isTV ? <ThemedDropdownComponentTV { ...props } /> : <ThemedDropdownComponent { ...props } />;
}

export default ThemedDropdownContainer;
