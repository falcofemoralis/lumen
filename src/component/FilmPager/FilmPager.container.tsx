import { useConfigContext, useIsTV } from 'Context/ConfigContext';

import FilmPagerComponent from './FilmPager.component';
import FilmPagerComponentTV from './FilmPager.component.atv';
import { FilmPagerContainerProps } from './FilmPager.type';

export function FilmPagerContainer(props: FilmPagerContainerProps) {
  const isTV = useIsTV();
  const { tvTabPosition } = useConfigContext();

  return isTV ? <FilmPagerComponentTV { ...props } tabPosition={ tvTabPosition } /> : <FilmPagerComponent { ...props } />;
}

export default FilmPagerContainer;
