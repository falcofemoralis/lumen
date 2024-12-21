import { MenuItemInterface } from 'Type/MenuItem.interface';
import { MenuApiInterface } from '..';

const menuApi: MenuApiInterface = {
  getHomeMenu: () => {
    return [
      {
        title: 'Горячие Новинки',
        path: '/engine/ajax/get_newest_slider_content.php',
        variables: { id: '0' },
        key: '.b-newest_slider__wrapper',
      },
      { title: 'Новинки', path: '/new' },
      { title: 'Сейчас смотрят', path: '/', variables: { filter: 'watching' } },
      {
        title: 'Последние Поступления',
        path: '/',
        variables: { filter: 'last' },
      },
      { title: 'Популярные', path: '/', variables: { filter: 'popular' } },
      { title: 'В ожидании ', path: '/', variables: { filter: 'soon' } },
    ] as MenuItemInterface[];
  },
};

export default menuApi;
