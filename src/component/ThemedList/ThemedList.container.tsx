import { withTV } from 'Hooks/withTV';

import ThemedListComponent from './ThemedList.component';
import ThemedListComponentTV from './ThemedList.component.atv';
import { ThemedListContainerProps } from './ThemedList.type';

export function ThemedListContainer(props: ThemedListContainerProps) {
  return withTV(ThemedListComponentTV, ThemedListComponent, props);
}

export default ThemedListContainer;
