import { useConfigContext } from 'Context/ConfigContext';

import ThemedButtonComponent from './ThemedButton.component';
import ThemedButtonComponentTV from './ThemedButton.component.atv';
import { ThemedButtonProps } from './ThemedButton.type';

export function ThemedButtonContainer(props: ThemedButtonProps) {
  const { isTV } = useConfigContext();

  return isTV ? <ThemedButtonComponentTV { ...props } /> : <ThemedButtonComponent { ...props } />;
}

export default ThemedButtonContainer;
