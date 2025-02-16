import { ScheduleItemInterface } from './ScheduleItem.interface';

export interface ScheduleInterface {
  name: string;
  items: ScheduleItemInterface[];
}
