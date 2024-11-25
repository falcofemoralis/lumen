import { withTV } from 'Hooks/withTV';
import { useEffect, useState } from 'react';
import { BackHandler } from 'react-native';
import ConfigStore from 'Store/Config.store';
import Film from 'Type/Film.interface';
import { FilmStream } from 'Type/FilmStream.interface';
import { FilmVideo } from 'Type/FilmVideo.interface';
import { FilmVoice } from 'Type/FilmVoice.interface';
import FilmPageComponent from './FilmPage.component';
import FilmPageComponentTV from './FilmPage.component.atv';
import { FilmPageContainerProps } from './FilmPage.type';
import ServiceStore from 'Store/Service.store';
import NotificationStore from 'Store/Notification.store';

export function FilmPageContainer(props: FilmPageContainerProps) {
  const { link } = props;
  const [film, setFilm] = useState<Film | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<FilmVoice | null>(null);
  const [selectedStream, setSelectedStream] = useState<FilmStream | null>(null);
  const [filmVideo, setFilmVideo] = useState<FilmVideo | null>(null);
  const [isSelectorVisible, setIsSelectorVisible] = useState(false);

  useEffect(() => {
    const backAction = () => {
      // if (filmVideo) {
      //   setFilmVideo(null);

      //   if (ConfigStore.isTV) {
      //     NavigationStore.toggleNavigation();
      //   }

      //   return true;
      // }

      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  });

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

  const handleVideoSelect = (video: FilmVideo) => {
    setFilmVideo(video);
  };

  const playFilm = () => {
    if (!film) {
      return;
    }

    const { video, voices } = film;

    if (video) {
      setFilmVideo(video);
      return;
    }

    if (voices && voices.length > 0) {
      openVideoSelector();
      return;
    }

    NotificationStore.displayMessage('No video streams available');
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
