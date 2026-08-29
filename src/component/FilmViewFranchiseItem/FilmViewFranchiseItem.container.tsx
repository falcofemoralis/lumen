import { useIsTV } from 'Context/ConfigContext';

import FilmViewFranchiseItemComponent from './FilmViewFranchiseItem.component';
import FilmViewFranchiseItemComponentTV from './FilmViewFranchiseItem.component.atv';
import { FilmViewFranchiseItemContainerProps } from './FilmViewFranchiseItem.type';

export function FilmViewFranchiseItemContainer(props: FilmViewFranchiseItemContainerProps) {
  const isTV = useIsTV();

  return isTV
    ? <FilmViewFranchiseItemComponentTV { ...props } />
    : <FilmViewFranchiseItemComponent { ...props } />;
}

export default FilmViewFranchiseItemContainer;
