import { useConfigContext } from 'Context/ConfigContext';

import FilmViewRelatedItemComponent from './FilmViewRelatedItem.component';
import FilmViewRelatedItemComponentTV from './FilmViewRelatedItem.component.atv';
import { FilmViewRelatedItemContainerProps } from './FilmViewRelatedItem.type';

export function FilmViewRelatedItemContainer(props: FilmViewRelatedItemContainerProps) {
  const { isTV } = useConfigContext();

  return isTV
    ? <FilmViewRelatedItemComponentTV { ...props } />
    : <FilmViewRelatedItemComponent { ...props } />;
}

export default FilmViewRelatedItemContainer;
