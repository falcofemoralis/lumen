import { withTV } from 'Hooks/withTV';
import { useEffect, useState } from 'react';
import { BackHandler } from 'react-native';
import NotificationStore from 'Store/Notification.store';
import ServiceStore from 'Store/Service.store';
import FilmInterface from 'Type/Film.interface';
import { FilmStreamInterface } from 'Type/FilmStream.interface';
import { FilmVideoInterface } from 'Type/FilmVideo.interface';
import { FilmVoiceInterface } from 'Type/FilmVoice.interface';
import FilmPageComponent from './FilmPage.component';
import FilmPageComponentTV from './FilmPage.component.atv';
import { FilmPageContainerProps } from './FilmPage.type';

export function FilmPageContainer(props: FilmPageContainerProps) {
  const { link } = props;
  const [film, setFilm] = useState<FilmInterface | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<FilmVoiceInterface | null>(null);
  const [selectedStream, setSelectedStream] = useState<FilmStreamInterface | null>(null);
  const [filmVideo, setFilmVideo] = useState<FilmVideoInterface | null>(null);
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

  const handleVideoSelect = (video: FilmVideoInterface) => {
    setFilmVideo(video);
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

    setFilmVideo(video);
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
