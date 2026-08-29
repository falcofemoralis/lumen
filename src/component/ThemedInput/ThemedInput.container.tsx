import { useIsTV } from 'Context/ConfigContext';

import ThemedInputComponent from './ThemedInput.component';
import ThemedInputComponentTV from './ThemedInput.component.atv';
import { ThemedInputContainerProps } from './ThemedInput.type';

export function ThemedInputContainer(props: ThemedInputContainerProps) {
  const isTV = useIsTV();

  return isTV ? <ThemedInputComponentTV { ...props } /> : <ThemedInputComponent { ...props } />;

}

export default ThemedInputContainer;
