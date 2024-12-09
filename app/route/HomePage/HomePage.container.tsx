import { ErrorBoundaryProps } from 'expo-router';
import { withTV } from 'Hooks/withTV';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import NotificationStore from 'Store/Notification.store';
import ServiceStore from 'Store/Service.store';
import FilmCardInterface from 'Type/FilmCard.interface';
import HomePageComponent from './HomePage.component';
import HomePageComponentTV from './HomePage.component.atv';
import { FilmGridPaginationInterface } from 'Component/FilmGrid/FilmGrid.type';

export function ErrorBoundary(props: ErrorBoundaryProps) {
  return <ErrorBoundary {...props} />;
}

export function HomePageContainer() {
  const [films, setFilms] = useState<FilmCardInterface[]>([]);

  const loadFilms = async (pagination: FilmGridPaginationInterface, isRefresh: boolean = false) => {
    console.log('load films');

    const { currentPage } = pagination;
    try {
      const { films: newFilms, totalPages } =
        await ServiceStore.getCurrentService().getHomePageFilms(currentPage, {
          isRefresh,
        });

      setFilms(isRefresh ? newFilms : Array.from(films).concat(newFilms));

      return {
        ...pagination,
        currentPage,
        totalPages,
      };
    } catch (error) {
      NotificationStore.displayError(error);
      throw error;
    }
  };

  const containerFunctions = {
    loadFilms,
  };

  const containerProps = () => {
    return {
      films,
    };
  };

  console.log('render homepage container');

  return withTV(HomePageComponentTV, HomePageComponent, {
    ...containerFunctions,
    ...containerProps(),
  });
}

export default observer(HomePageContainer);
