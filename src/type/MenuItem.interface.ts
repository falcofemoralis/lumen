import { Variables } from 'Util/Request';

export interface MenuItemInterface {
  id: string;
  title: string;
  path: string;
  key?: string;
  variables?: Variables;
  subMenuItems?: MenuItemInterface[];
}
