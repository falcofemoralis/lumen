import { router } from 'expo-router';
import { withTV } from 'Hooks/withTV';
import { useCallback, useEffect, useState } from 'react';
import NotificationStore from 'Store/Notification.store';
import OverlayStore from 'Store/Overlay.store';
import RouterStore from 'Store/Router.store';
import ServiceStore from 'Store/Service.store';
import { FilmInterface } from 'Type/Film.interface';
import { FilmVideoInterface } from 'Type/FilmVideo.interface';
import { FilmVoiceInterface } from 'Type/FilmVoice.interface';
import { ScheduleItemInterface } from 'Type/ScheduleItem.interface';

import FilmPageComponent from './FilmPage.component';
import FilmPageComponentTV from './FilmPage.component.atv';
import { COMMENTS_OVERLAY_ID, MINIMUM_SCHEDULE_ITEMS, PLAYER_VIDEO_SELECTOR_OVERLAY_ID } from './FilmPage.config';
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

    loadFilm();
  }, []);

  const openVideoSelector = useCallback(async () => {
    if (!film) {
      return;
    }

    OverlayStore.openOverlay(PLAYER_VIDEO_SELECTOR_OVERLAY_ID);
  }, [film]);

  const hideVideoSelector = useCallback(() => {
    OverlayStore.goToPreviousOverlay();
  }, []);

  const handleVideoSelect = (video: FilmVideoInterface, voice: FilmVoiceInterface) => {
    hideVideoSelector();
    openPlayer(video, voice);
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

    const voice = voices[0];
    const { video } = voice;

    if (!video) {
      NotificationStore.displayMessage('No video streams available');

      return;
    }

    openPlayer(video, voice);
  };

  const openPlayer = (video: FilmVideoInterface, voice: FilmVoiceInterface) => {
    RouterStore.pushData('player', {
      video,
      film,
      voice,
    });

    router.push({
      pathname: '/player',
    });
  };

  const handleSelectFilm = useCallback((filmLink: string) => {
    router.push({
      pathname: '/[film]',
      params: {
        film: filmLink,
      },
    });
  }, []);

  const getVisibleScheduleItems = useCallback(() => {
    if (!film) {
      return [];
    }

    const { schedule = [] } = film;

    if (!schedule.length) {
      return [];
    }

    const { items } = schedule[0];

    const initialItems = items.reduce<ScheduleItemInterface[]>((acc, item) => {
      if (!item.isReleased) {
        acc.push(item);
      } else if (acc.length < MINIMUM_SCHEDULE_ITEMS) {
        acc.push(item);
      }

      return acc;
    }, []);

    return initialItems;
  }, [film]);

  const openCommentsOverlay = useCallback(async () => {
    if (!film) {
      return;
    }

    OverlayStore.openOverlay(COMMENTS_OVERLAY_ID);
  }, [film]);

  const closeCommentsOverlay = useCallback(() => {
    OverlayStore.goToPreviousOverlay();
  }, []);

  const containerProps = () => ({
    film,
    visibleScheduleItems: getVisibleScheduleItems(),
  });

  const containerFunctions = {
    playFilm,
    hideVideoSelector,
    handleVideoSelect,
    handleSelectFilm,
    openCommentsOverlay,
    closeCommentsOverlay,
  };

  return withTV(FilmPageComponentTV, FilmPageComponent, {
    ...containerProps(),
    ...containerFunctions,
  });
}

export default FilmPageContainer;
