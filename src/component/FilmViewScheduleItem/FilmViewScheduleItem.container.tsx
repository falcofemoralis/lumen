import { useConfigContext } from 'Context/ConfigContext';

import FilmViewScheduleItemComponent from './FilmViewScheduleItem.component';
import FilmViewScheduleItemComponentTV from './FilmViewScheduleItem.component.atv';
import { FilmViewScheduleItemContainerProps } from './FilmViewScheduleItem.type';

export function FilmViewScheduleItemContainer(props: FilmViewScheduleItemContainerProps) {
  const { isTV } = useConfigContext();

  return isTV
    ? <FilmViewScheduleItemComponentTV { ...props } />
    : <FilmViewScheduleItemComponent { ...props } />;
}

export default FilmViewScheduleItemContainer;
