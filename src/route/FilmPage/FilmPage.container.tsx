import { PLAYER_VIDEO_SELECTOR_OVERLAY_ID } from 'Component/PlayerVideoSelector/PlayerVideoSelector.config';
import { router } from 'expo-router';
import { withTV } from 'Hooks/withTV';
import { useCallback, useEffect, useState } from 'react';
import NotificationStore from 'Store/Notification.store';
import OverlayStore from 'Store/Overlay.store';
import ServiceStore from 'Store/Service.store';
import { FilmInterface } from 'Type/Film.interface';
import { FilmVideoInterface } from 'Type/FilmVideo.interface';

import FilmPageComponent from './FilmPage.component';
import FilmPageComponentTV from './FilmPage.component.atv';
import { FilmPageContainerProps } from './FilmPage.type';

export function FilmPageContainer({ link }: FilmPageContainerProps) {
  const [film, setFilm] = useState<FilmInterface | null>(null);

  useEffect(() => {
    const loadFilm = async () => {
      try {
        const loadedFilm = await ServiceStore.getCurrentService().getFilm(link);

        setFilm(loadedFilm);
      } catch (error) {
        NotificationStore.displayError(error as Error);
      }
    };

    setFilm(null);

    loadFilm();
  }, [link]);

  const openVideoSelector = useCallback(async () => {
    if (!film) {
      return;
    }

    OverlayStore.openOverlay(PLAYER_VIDEO_SELECTOR_OVERLAY_ID);
  }, [film]);

  const hideVideoSelector = useCallback(() => {
    OverlayStore.goToPreviousOverlay();
  }, []);

  const handleVideoSelect = (video: FilmVideoInterface) => {
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

    const { video } = voices[0];

    if (!video) {
      NotificationStore.displayMessage('No video streams available');

      return;
    }

    openPlayer(video);
  };

  const openPlayer = (video: FilmVideoInterface) => {
    router.push({
      pathname: '/player/[data]',
      params: {
        data: JSON.stringify({
          video,
          film,
        }),
      },
    });
  };

  const containerProps = () => ({
    film,
  });

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
