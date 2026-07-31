import { useConfigContext } from 'Context/ConfigContext';

import FilmViewSectionComponent from './FilmViewSection.component';
import FilmViewSectionComponentTV from './FilmViewSection.component.atv';
import { FilmViewSectionContainerProps } from './FilmViewSection.type';

export function FilmViewSectionContainer(props: FilmViewSectionContainerProps) {
  const { isTV } = useConfigContext();

  return isTV ? <FilmViewSectionComponentTV { ...props } /> : <FilmViewSectionComponent { ...props } />;
}

export default FilmViewSectionContainer;
