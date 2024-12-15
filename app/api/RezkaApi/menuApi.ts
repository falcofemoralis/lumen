import { MenuItemInterface } from 'Type/MenuItem.interface';
import { MenuApiInterface } from '..';

const menuApi: MenuApiInterface = {
  getHomeMenu: () => {
    return [
      { title: 'Горячие Новинки', path: '/', key: '.b-newest_slider__wrapper' },
      { title: 'Новинки', path: '/new' },
      { title: 'Последние Поступления', path: '/', key: '.b-content' },
      { title: 'Популярные', path: '/', variables: { filter: 'popular' }, key: '.b-content' },
      { title: 'В ожидании ', path: '/', variables: { filter: 'soon' }, key: '.b-content' },
      { title: 'Сейчас смотрят', path: '/', variables: { filter: 'watching' }, key: '.b-content' },
    ] as MenuItemInterface[];
  },
};

export default menuApi;
