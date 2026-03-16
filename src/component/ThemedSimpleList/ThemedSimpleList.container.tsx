import { useConfigContext } from 'Context/ConfigContext';

import ThemedSimpleListComponent from './ThemedSimpleList.component';
import ThemedSimpleListComponentTV from './ThemedSimpleList.component.atv';
import { ThemedSimpleListContainerProps } from './ThemedSimpleList.type';

export function ThemedSimpleListContainer(props: ThemedSimpleListContainerProps) {
  const { isTV } = useConfigContext();

  return isTV ? <ThemedSimpleListComponentTV { ...props } /> : <ThemedSimpleListComponent { ...props } />;
}

export default ThemedSimpleListContainer;
