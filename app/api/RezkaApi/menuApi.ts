import { MenuItemInterface } from 'Type/MenuItem.interface';
import { MenuApiInterface } from '..';

const menuApi: MenuApiInterface = {
  getHomeMenu: () => {
    return [
      { title: 'Горячие Новинки', path: '/', key: 'slider' },
      { title: 'Новинки', path: '/new' },
      { title: 'Последние Поступления', path: '/', key: 'root' },
      { title: 'Популярные', path: '/', variables: { filter: 'popular' }, key: 'root' },
      { title: 'В ожидании ', path: '/', variables: { filter: 'soon' }, key: 'root' },
      { title: 'Сейчас смотрят', path: '/', variables: { filter: 'watching' }, key: 'root' },
    ] as MenuItemInterface[];
  },
};

export default menuApi;
