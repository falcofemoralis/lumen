import { useIsTV } from 'Context/ConfigContext';

import ThemedCustomSelectComponent from './ThemedCustomSelect.component';
import ThemedCustomSelectComponentTV from './ThemedCustomSelect.component.atv';
import { ThemedCustomSelectComponentProps } from './ThemedCustomSelect.type';

export function ThemedCustomSelectContainer(props: ThemedCustomSelectComponentProps) {
  const isTV = useIsTV();

  return isTV ? <ThemedCustomSelectComponentTV { ...props } /> : <ThemedCustomSelectComponent { ...props } />;
}

export default ThemedCustomSelectContainer;
