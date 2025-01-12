import { MenuItemInterface } from 'Type/MenuItem.interface';

import { MenuApiInterface } from '..';

const menuApi: MenuApiInterface = {
  getHomeMenu: () => [
    {
      id: 'slider',
      title: 'Горячие Новинки',
      path: '/engine/ajax/get_newest_slider_content.php',
      variables: { id: '0' },
      key: '.b-newest_slider__wrapper',
    },
    {
      id: 'new',
      title: 'Новинки',
      path: '/new',
    },
    {
      id: 'watching',
      title: 'Сейчас смотрят',
      path: '/new',
      variables: { filter: 'watching' },
    },
    {
      id: 'popular',
      title: 'Популярные',
      path: '/new',
      variables: { filter: 'popular' },
    },
    {
      id: 'soon',
      title: 'В ожидании ',
      path: '/announce',
    },
  ] as MenuItemInterface[],
};

export default menuApi;
