import { useEffect, useState } from 'react';
import AppStore from 'Store/App.store';
import Film from 'Type/Film.interface';
import FilmPageComponent from './FilmPage.component';
import FilmPageComponentTV from './FilmPage.component.atv';
import { FilmPageContainerProps } from './FilmPage.type';
import { withTV } from 'Hooks/withTV';
import { FilmVideo } from 'Type/FilmVideo.interface';
import NavigationStore from 'Store/Navigation.store';
import { BackHandler } from 'react-native';

export function FilmPageContainer(props: FilmPageContainerProps) {
  const { link } = props;
  const [film, setFilm] = useState<Film | null>(null);
  const [filmVideo, setFilmVideo] = useState<FilmVideo | null>(null);

  useEffect(() => {
    const backAction = () => {
      if (filmVideo) {
        setFilmVideo(null);

        if (AppStore.isTV) {
          NavigationStore.toggleNavigation();
        }

        return true;
      }

      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  });

  const playFilm = async () => {
    if (!film) {
      return;
    }

    const video = await AppStore.currentService.getFilmVideo(film);

    if (AppStore.isTV) {
      NavigationStore.toggleNavigation();
    }

    setFilmVideo(video);
  };

  useEffect(() => {
    const loadFilm = async () => {
      const film = await AppStore.currentService.getFilm(link);

      setFilm(film);
    };

    loadFilm();
  }, [link]);

  const containerProps = () => {
    return {
      film,
      filmVideo,
    };
  };

  const containerFunctions = {
    playFilm,
  };

  return withTV(FilmPageComponentTV, FilmPageComponent, {
    ...containerProps(),
    ...containerFunctions,
  });
}

export default FilmPageContainer;
