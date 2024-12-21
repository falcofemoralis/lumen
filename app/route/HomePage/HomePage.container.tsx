import { withTV } from 'Hooks/withTV';
import { observer } from 'mobx-react-lite';
import ServiceStore from 'Store/Service.store';
import { MenuItemInterface } from 'Type/MenuItem.interface';
import HomePageComponent from './HomePage.component';
import HomePageComponentTV from './HomePage.component.atv';

export function HomePageContainer() {
  const onLoadFilms = async (
    menuItem: MenuItemInterface,
    currentPage: number,
    isRefresh: boolean
  ) => {
    return ServiceStore.getCurrentService().getHomeMenuFilms(menuItem, currentPage, {
      isRefresh,
    });
  };

  const getMenuItems = () => {
    return ServiceStore.getCurrentService().getHomeMenu();
  };

  const containerFunctions = {
    onLoadFilms,
  };

  const containerProps = () => {
    return {
      menuItems: getMenuItems(),
    };
  };

  return withTV(HomePageComponentTV, HomePageComponent, {
    ...containerFunctions,
    ...containerProps(),
  });
}

export default observer(HomePageContainer);
