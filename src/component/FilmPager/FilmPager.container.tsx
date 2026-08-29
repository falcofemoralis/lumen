import { useIsTV } from 'Context/ConfigContext';

import FilmPagerComponent from './FilmPager.component';
import FilmPagerComponentTV from './FilmPager.component.atv';
import { FilmPagerContainerProps } from './FilmPager.type';

export function FilmPagerContainer(props: FilmPagerContainerProps) {
  const isTV = useIsTV();

  return isTV ? <FilmPagerComponentTV { ...props } /> : <FilmPagerComponent { ...props } />;
}

export default FilmPagerContainer;
