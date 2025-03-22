import { withTV } from 'Hooks/withTV';

import ThemedInfoComponent from './ThemedInfo.component';
import ThemedInfoComponentTV from './ThemedInfo.component.atv';
import { ThemedInfoContainerProps } from './ThemedInfo.type';

export function ThemedInfoContainer({
  title,
  subtitle,
}: ThemedInfoContainerProps) {
  const containerFunctions = {
  };

  const containerProps = () => ({
    title,
    subtitle,
  });

  return withTV(ThemedInfoComponentTV, ThemedInfoComponent, {
    ...containerFunctions,
    ...containerProps(),
  });
}

export default ThemedInfoContainer;
