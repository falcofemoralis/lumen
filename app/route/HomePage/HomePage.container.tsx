import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import AppStore from 'Store/App.store';
import FilmCard from 'Type/FilmCard.interface';
import HomePageComponent from './HomePage.component';
import { withTV } from 'Hooks/withTV';

export function HomePageContainer() {
  const [films, setFilms] = useState<FilmCard[]>([]);

  useEffect(() => {
    const loadFilms = async () => {
      console.log('loadFilms');
      const filmList = await AppStore.currentService.getFilms(1);
      const { films } = filmList;

      setFilms(films);
    };

    loadFilms();
  }, []);

  const containerFunctions = {};

  const containerProps = () => {
    return {
      films,
    };
  };

  return withTV(HomePageComponent, HomePageComponent, {
    ...containerFunctions,
    ...containerProps(),
  });
}

export default observer(HomePageContainer);
