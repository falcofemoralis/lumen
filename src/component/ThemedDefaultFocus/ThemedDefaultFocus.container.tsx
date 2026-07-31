import { useConfigContext } from 'Context/ConfigContext';

import ThemedDefaultFocusComponent from './ThemedDefaultFocus.component';
import ThemedDefaultFocusComponentTV from './ThemedDefaultFocus.component.atv';
import { ThemedDefaultFocusProps } from './ThemedDefaultFocus.type';

export function ThemedDefaultFocusContainer(props: ThemedDefaultFocusProps) {
  const { isTV } = useConfigContext();

  return isTV ? <ThemedDefaultFocusComponentTV { ...props } /> : <ThemedDefaultFocusComponent />;
}

export default ThemedDefaultFocusContainer;
