import { withTV } from 'Hooks/withTV';
import { memo } from 'react';

import ThemedDropdownComponent from './ThemedDropdown.component';
import ThemedDropdownComponentTV from './ThemedDropdown.component.atv';
import { ThemedDropdownContainerProps } from './ThemedDropdown.type';

export function ThemedDropdownContainer(props: ThemedDropdownContainerProps) {
  return withTV(ThemedDropdownComponentTV, ThemedDropdownComponent, props);
}

function propsAreEqual(
  prevProps: ThemedDropdownContainerProps,
  props: ThemedDropdownContainerProps,
) {
  return JSON.stringify(prevProps.data) === JSON.stringify(props.data)
    && prevProps.value === props.value;
}

export default memo(ThemedDropdownContainer, propsAreEqual);
