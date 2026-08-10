import { StyleProp, ViewStyle } from 'react-native';
import { ScheduleItemInterface } from 'Type/ScheduleItem.interface';

export interface FilmViewScheduleItemContainerProps {
  item: ScheduleItemInterface;
  handleUpdateScheduleWatch: (scheduleItem: ScheduleItemInterface) => Promise<boolean>;
  useInternalState?: boolean;
  style?: StyleProp<ViewStyle>;
}

export type FilmViewScheduleItemComponentProps = FilmViewScheduleItemContainerProps;
