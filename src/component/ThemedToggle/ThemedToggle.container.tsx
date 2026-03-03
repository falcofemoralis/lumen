import { useConfigContext } from 'Context/ConfigContext';

import ThemedToggleComponent from './ThemedToggle.component';
import ThemedToggleComponentTV from './ThemedToggle.component.atv';
import { SwitchToggleProps } from './ThemedToggle.type';

export function ThemedToggleContainer(props: SwitchToggleProps) {
  const { isTV } = useConfigContext();

  return isTV ? <ThemedToggleComponentTV { ...props } /> : <ThemedToggleComponent { ...props } />;

}

export default ThemedToggleContainer;
