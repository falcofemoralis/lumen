import { ErrorBoundaryProps } from 'expo-router';
import { withTV } from 'Hooks/withTV';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import NotificationStore from 'Store/Notification.store';
import ServiceStore from 'Store/Service.store';
import FilmCardInterface from 'Type/FilmCard.interface';
import HomePageComponent from './HomePage.component';
import HomePageComponentTV from './HomePage.component.atv';

export function ErrorBoundary(props: ErrorBoundaryProps) {
  return <ErrorBoundary {...props} />;
}

export function HomePageContainer() {
  const [films, setFilms] = useState<FilmCardInterface[]>([]);

  useEffect(() => {
    const loadFilms = async () => {
      try {
        const filmList = await ServiceStore.getCurrentService().getFilms(1);
        const { films } = filmList;

        setFilms(films);
      } catch (error) {
        NotificationStore.displayError(error);
      }
    };

    loadFilms();
  }, []);

  const onScrollEnd = async () => {
    console.log('Scroll end');
    const filmList = await ServiceStore.getCurrentService().getFilms(2);
    const { films: newFilms } = filmList;

    const updatedFilms = films.concat(newFilms);

    setFilms(updatedFilms);
  };

  const containerFunctions = {
    onScrollEnd,
  };

  const containerProps = () => {
    return {
      films,
    };
  };

  return withTV(HomePageComponentTV, HomePageComponent, {
    ...containerFunctions,
    ...containerProps(),
  });
}

export default observer(HomePageContainer);
