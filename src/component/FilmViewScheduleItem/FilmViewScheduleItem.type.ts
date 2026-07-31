import { ScheduleItemInterface } from 'Type/ScheduleItem.interface';

export interface FilmViewScheduleItemContainerProps {
  item: ScheduleItemInterface;
  handleUpdateScheduleWatch: (scheduleItem: ScheduleItemInterface) => Promise<boolean>;
  useInternalState?: boolean;
}

export type FilmViewScheduleItemComponentProps = FilmViewScheduleItemContainerProps;
