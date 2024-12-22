import { router } from 'expo-router';
import { withTV } from 'Hooks/withTV';
import { useEffect, useState } from 'react';
import NotificationStore from 'Store/Notification.store';
import ServiceStore from 'Store/Service.store';
import FilmInterface from 'Type/Film.interface';
import { FilmVideoInterface } from 'Type/FilmVideo.interface';
import FilmPageComponent from './FilmPage.component';
import FilmPageComponentTV from './FilmPage.component.atv';
import { FilmPageContainerProps } from './FilmPage.type';
import ConfigStore from 'Store/Config.store';
import NavigationStore from 'Store/Navigation.store';

export function FilmPageContainer(props: FilmPageContainerProps) {
  const { link } = props;
  const [film, setFilm] = useState<FilmInterface | null>(null);
  const [filmVideo, setFilmVideo] = useState<FilmVideoInterface | null>(null);
  const [isSelectorVisible, setIsSelectorVisible] = useState(false);

  console.log(`FilmPageContainer render ${!!film}`);

  useEffect(() => {
    const loadFilm = async () => {
      try {
        const film = await ServiceStore.getCurrentService().getFilm(link);

        setFilm(film);
      } catch (error) {
        NotificationStore.displayError(error);
      }
    };

    loadFilm();

    return () => {
      console.log('FilmPageContainer unmount');
    };
  }, [link]);

  const openVideoSelector = async () => {
    if (!film) {
      return;
    }

    setIsSelectorVisible(true);
  };

  const hideVideoSelector = () => {
    setIsSelectorVisible(false);
  };

  const handleVideoSelect = (video: FilmVideoInterface) => {
    //setFilmVideo(video);
    hideVideoSelector();
    openPlayer(video);
  };

  const playFilm = () => {
    if (!film) {
      return;
    }

    const { voices, hasVoices, hasSeasons } = film;

    if (voices.length <= 0) {
      NotificationStore.displayMessage('No video available');
      return;
    }

    if (hasVoices || hasSeasons) {
      openVideoSelector();
      return;
    }

    const video = voices[0].video;

    if (!video) {
      NotificationStore.displayMessage('No video streams available');
      return;
    }

    //setFilmVideo(video);
    openPlayer(video);
  };

  const openPlayer = (video: FilmVideoInterface) => {
    if (ConfigStore.isTV) {
      NavigationStore.hideNavigation();
    }

    router.push({
      pathname: '/player/[data]',
      params: { data: JSON.stringify(video) },
    });
  };

  const containerProps = () => {
    return {
      film,
      filmVideo,
      isSelectorVisible,
    };
  };

  const containerFunctions = {
    playFilm,
    hideVideoSelector,
    handleVideoSelect,
  };

  return withTV(FilmPageComponentTV, FilmPageComponent, {
    ...containerProps(),
    ...containerFunctions,
  });
}

export default FilmPageContainer;
