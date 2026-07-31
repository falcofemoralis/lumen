import { useConfigContext } from 'Context/ConfigContext';

import FilmViewActorComponent from './FilmViewActor.component';
import FilmViewActorComponentTV from './FilmViewActor.component.atv';
import { FilmViewActorContainerProps } from './FilmViewActor.type';

export function FilmViewActorContainer(props: FilmViewActorContainerProps) {
  const { isTV } = useConfigContext();

  return isTV ? <FilmViewActorComponentTV { ...props } /> : <FilmViewActorComponent { ...props } />;
}

export default FilmViewActorContainer;
