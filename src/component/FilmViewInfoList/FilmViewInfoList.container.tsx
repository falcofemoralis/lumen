import { useIsTV } from 'Context/ConfigContext';

import FilmViewInfoListComponent from './FilmViewInfoList.component';
import FilmViewInfoListComponentTV from './FilmViewInfoList.component.atv';
import { FilmViewInfoListContainerProps } from './FilmViewInfoList.type';

export function FilmViewInfoListContainer(props: FilmViewInfoListContainerProps) {
  const isTV = useIsTV();

  return isTV ? <FilmViewInfoListComponentTV { ...props } /> : <FilmViewInfoListComponent { ...props } />;
}

export default FilmViewInfoListContainer;
