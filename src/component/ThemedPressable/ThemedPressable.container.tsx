import { withTV } from 'Hooks/withTV';

import ThemedPressableComponent from './ThemedPressable.component';
import ThemedPressableComponentTV from './ThemedPressable.component.atv';
import { ThemedPressableContainerProps } from './ThemedPressable.type';

export function ThemedPressableContainer(props: ThemedPressableContainerProps) {
  const { resolveAsMobile } = props;

  // this code is used on welcome page
  if (resolveAsMobile) {
    return <ThemedPressableComponent { ...props } />;
  }

  return withTV(ThemedPressableComponentTV, ThemedPressableComponent, props);
}

export default ThemedPressableContainer;
