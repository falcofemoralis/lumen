import { useConfigContext } from 'Context/ConfigContext';

import ThemedPressableComponent from './ThemedPressable.component';
import ThemedPressableComponentTV from './ThemedPressable.component.atv';
import { ThemedPressableContainerProps } from './ThemedPressable.type';

export function ThemedPressableContainer(props: ThemedPressableContainerProps) {
  const { resolveAsMobile } = props;
  const { isTV } = useConfigContext();

  // this code is used on welcome page
  if (resolveAsMobile) {
    return <ThemedPressableComponent { ...props } />;
  }

  return isTV ? <ThemedPressableComponentTV { ...props } /> : <ThemedPressableComponent { ...props } />;

}

export default ThemedPressableContainer;
