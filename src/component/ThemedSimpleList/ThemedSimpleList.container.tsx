import { withTV } from 'Hooks/withTV';

import ThemedSimpleListComponent from './ThemedSimpleList.component';
import ThemedSimpleListComponentTV from './ThemedSimpleList.component.atv';
import { ThemedSimpleListContainerProps } from './ThemedSimpleList.type';

export function ThemedSimpleListContainer(props: ThemedSimpleListContainerProps) {
  return withTV(ThemedSimpleListComponentTV, ThemedSimpleListComponent, props);
}

export default ThemedSimpleListContainer;
