import { withTV } from 'Hooks/withTV';

import ThemedCardComponent from './ThemedCard.component';
import ThemedCardComponentTV from './ThemedCard.component.atv';
import { ThemedCardContainerProps } from './ThemedCard.type';

export const ThemedCardContainer = (
  props: ThemedCardContainerProps
) => withTV(ThemedCardComponentTV, ThemedCardComponent, props);

export default ThemedCardContainer;
