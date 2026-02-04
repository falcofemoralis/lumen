import { useConfigContext } from 'Context/ConfigContext';

import ThemedListComponent from './ThemedList.component';
import ThemedListComponentTV from './ThemedList.component.atv';
import { ThemedListContainerProps } from './ThemedList.type';

export function ThemedListContainer(props: ThemedListContainerProps) {
  const { isTV } = useConfigContext();

  return isTV ? <ThemedListComponentTV { ...props } /> : <ThemedListComponent { ...props } />;
}

export default ThemedListContainer;
