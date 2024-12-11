import { Variables } from 'Util/Request';

export interface MenuItemInterface {
  title: string;
  path: string;
  key?: string;
  variables?: Variables;
  subMenuItems?: MenuItemInterface[];
}
