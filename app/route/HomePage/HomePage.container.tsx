import { ApiProvider } from 'Api/ApiProvider';
import HomePageComponent from './HomePage.component';
import { useEffect, useState } from 'react';
import FilmType from 'Type/Film.type';

export function HomePageContainer() {
  const [film, setFilm] = useState<FilmType>({ info: '' });

  const containerFunctions = {};

  const containerProps = () => {
    const test = 'test2';

    return {
      film,
      test,
    };
  };

  const loadFilm = async () => {
    console.log('loadFilm');
    const film = await ApiProvider().getFilmApi().getFilm();

    setFilm(film);
  };

  useEffect(() => {
    //loadFilm();
  }, []);

  return <HomePageComponent {...containerFunctions} {...containerProps()} />;
}

export default HomePageContainer;
