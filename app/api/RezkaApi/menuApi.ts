import { MenuApiInterface } from '..';

const menuApi: MenuApiInterface = {
  getHomeMenu: () => {
    return [
      { title: 'Горячие Новинки', path: '/' }, // slider
      { title: 'Новинки', path: '/new' },
      { title: 'Последние Поступления', path: '/' },
      { title: 'Популярные', path: '/?filter=last' },
      { title: 'В ожидании ', path: '/?filter=popular' },
      { title: 'Сейчас смотрят', path: '/?filter=watching' },
    ];
  },
};

export default menuApi;
