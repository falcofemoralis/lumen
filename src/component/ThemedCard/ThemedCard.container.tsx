import { withTV } from 'Hooks/withTV';

import ThemedCardComponent from './ThemedCard.component.atv';
import { ThemedCardContainerProps } from './ThemedCard.type';

export const ThemedCardContainer = (
  props: ThemedCardContainerProps,
) => withTV(ThemedCardComponent, ThemedCardComponent, props);

export default ThemedCardContainer;
