import { useEffect, useState } from 'react';
import AppStore from 'Store/App.store';
import Film from 'Type/Film.interface';
import FilmPageComponent from './FilmPage.component';
import FilmPageComponentTV from './FilmPage.component.atv';
import { FilmPageContainerProps } from './FilmPage.type';
import { withTV } from 'Hooks/withTV';

export function FilmPageContainer(props: FilmPageContainerProps) {
  const { link } = props;
  const [film, setFilm] = useState<Film | null>(null);

  useEffect(() => {
    const loadFilm = async () => {
      console.log('loadFilm');
      const film = await AppStore.currentService.getFilm(link);

      setFilm(film);
    };

    loadFilm();
  }, [link]);

  const containerProps = () => {
    return {
      film,
    };
  };

  return withTV(FilmPageComponentTV, FilmPageComponent, { ...containerProps() });
}

export default FilmPageContainer;