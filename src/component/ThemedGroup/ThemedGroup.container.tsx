import { useConfigContext } from 'Context/ConfigContext';

import ThemedGroupComponent from './ThemedGroup.component';
import ThemedGroupComponentTV from './ThemedGroup.component.atv';
import { ThemedGroupContainerProps } from './ThemedScrollView.type';

export function ThemedGroupContainer(props: ThemedGroupContainerProps) {
  const { isTV } = useConfigContext();

  return isTV ? <ThemedGroupComponentTV { ...props } /> : <ThemedGroupComponent { ...props } />;
}

export default ThemedGroupContainer;
