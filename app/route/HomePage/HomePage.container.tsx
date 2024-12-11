import { FilmGridPaginationInterface } from 'Component/FilmGrid/FilmGrid.type';
import { ErrorBoundaryProps } from 'expo-router';
import { withTV } from 'Hooks/withTV';
import { observer } from 'mobx-react-lite';
import { useRef, useState } from 'react';
import NotificationStore from 'Store/Notification.store';
import ServiceStore from 'Store/Service.store';
import FilmCardInterface from 'Type/FilmCard.interface';
import { MenuItemInterface } from 'Type/MenuItem.interface';
import HomePageComponent from './HomePage.component';
import HomePageComponentTV from './HomePage.component.atv';

export function ErrorBoundary(props: ErrorBoundaryProps) {
  return <ErrorBoundary {...props} />;
}

export function HomePageContainer() {
  const [films, setFilms] = useState<FilmCardInterface[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItemInterface>(
    ServiceStore.getCurrentService().getHomeMenu()[0]
  );
  const selectedMenuItemRef = useRef<MenuItemInterface>(
    ServiceStore.getCurrentService().getHomeMenu()[0]
  );
  const debounce = useRef<NodeJS.Timeout | undefined>();

  console.log('render container');

  const loadFilms = async (
    pagination: FilmGridPaginationInterface,
    isUpdate = false,
    isRefresh = false
  ) => {
    console.log('load films');

    const { currentPage } = pagination;

    setIsLoading(true);

    try {
      const { films: newFilms, totalPages } =
        await ServiceStore.getCurrentService().getHomeMenuFilms(
          selectedMenuItemRef.current,
          currentPage,
          {
            isRefresh,
          }
        );

      console.log('set films');

      setFilms(isUpdate ? newFilms : Array.from(films).concat(newFilms));
      setIsLoading(false);

      return {
        ...pagination,
        currentPage,
        totalPages,
      };
    } catch (error) {
      setIsLoading(false);
      NotificationStore.displayError(error);
      throw error;
    }
  };

  const handleMenuItemChange = (menuItem: MenuItemInterface) => {
    if (JSON.stringify(menuItem) !== JSON.stringify(selectedMenuItemRef.current)) {
      if (films.length > 0) {
        setTimeout(() => {
          setFilms([]);
        }, 0);
      }

      setSelectedMenuItem(menuItem);

      clearTimeout(debounce.current);

      debounce.current = setTimeout(() => {
        selectedMenuItemRef.current = menuItem;
        loadFilms({ currentPage: 1, totalPages: 1 }, true);
      }, 1000);
    }
  };

  const containerFunctions = {
    loadFilms,
    handleMenuItemChange,
  };

  const containerProps = () => {
    return {
      films,
      isLoading,
      selectedMenuItem,
    };
  };

  return withTV(HomePageComponentTV, HomePageComponent, {
    ...containerFunctions,
    ...containerProps(),
  });
}

export default observer(HomePageContainer);
