import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import AppStore from 'Store/App.store';
import Film from 'Type/Film.interface';
import HomePageComponent from './HomePage.component';

export function HomePageContainer() {
  const [films, setFilms] = useState<Film[]>([]);

  const loadFilms = async () => {
    console.log('loadFilms');
    const filmList = await AppStore.getCurrentService().getFilms(1);
    const { films } = filmList;

    setFilms(films);
  };

  useEffect(() => {
    loadFilms();
  }, []);

  const containerFunctions = {};

  const containerProps = () => {
    return {
      films,
    };
  };

  return (
    <HomePageComponent
      {...containerFunctions}
      {...containerProps()}
    />
  );
}

export default observer(HomePageContainer);
