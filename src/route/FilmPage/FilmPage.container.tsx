import { useOverlayContext } from 'Context/OverlayContext';
import { useServiceContext } from 'Context/ServiceContext';
import { router } from 'expo-router';
import { withTV } from 'Hooks/withTV';
import t from 'i18n/t';
import {
  useCallback, useEffect, useId, useState,
} from 'react';
import { Share } from 'react-native';
import NotificationStore from 'Store/Notification.store';
import RouterStore from 'Store/Router.store';
import { FilmInterface } from 'Type/Film.interface';
import { FilmVideoInterface } from 'Type/FilmVideo.interface';
import { FilmVoiceInterface } from 'Type/FilmVoice.interface';
import { ScheduleItemInterface } from 'Type/ScheduleItem.interface';
import { prepareShareBody } from 'Util/Player';
import { openActor, openCategory, openFilm } from 'Util/Router';

import FilmPageComponent from './FilmPage.component';
import FilmPageComponentTV from './FilmPage.component.atv';
import { MINIMUM_SCHEDULE_ITEMS } from './FilmPage.config';
import { FilmPageContainerProps } from './FilmPage.type';

export function FilmPageContainer({ link, thumbnailPoster }: FilmPageContainerProps) {
  const { openOverlay, goToPreviousOverlay } = useOverlayContext();
  const [film, setFilm] = useState<FilmInterface | null>(null);
  const playerVideoSelectorOverlayId = useId();
  const scheduleOverlayId = useId();
  const commentsOverlayId = useId();
  const bookmarksOverlayId = useId();
  const { isSignedIn, getCurrentService } = useServiceContext();

  useEffect(() => {
    const loadFilm = async () => {
      try {
        const loadedFilm = await getCurrentService().getFilm(link);

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

    openOverlay(playerVideoSelectorOverlayId);
  }, [film, playerVideoSelectorOverlayId]);

  const hideVideoSelector = useCallback(() => {
    goToPreviousOverlay();
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

    if (isSignedIn) {
      getCurrentService().saveWatch(film, voice)
        .catch((error) => {
          NotificationStore.displayError(error as Error);
        });
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

  const handleSelectFilm = useCallback((f: FilmInterface) => {
    openFilm(f);
  }, []);

  const handleSelectActor = useCallback((actorLink: string) => {
    openActor(actorLink);
  }, []);

  const handleSelectCategory = useCallback((categoryLink: string) => {
    openCategory(categoryLink);
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

  const handleUpdateScheduleWatch = useCallback(async (scheduleItem: ScheduleItemInterface) => {
    const { id } = scheduleItem;

    if (!isSignedIn) {
      NotificationStore.displayMessage(t('Sign In to an Account'));

      return false;
    }

    try {
      getCurrentService().saveScheduleWatch(id);
    } catch (error) {
      NotificationStore.displayError(error as Error);

      return false;
    }

    setFilm((prevFilm) => {
      if (!prevFilm) {
        return prevFilm;
      }

      const { schedule = [] } = prevFilm;

      const newSchedule = schedule.map((s) => {
        return {
          ...s,
          items: s.items.map((i) => {
            if (i.id === id) {
              return { ...i, isWatched: !i.isWatched };
            }

            return i;
          }),
        };
      });

      return {
        ...prevFilm,
        schedule: newSchedule,
      };
    });

    return true;
  }, [isSignedIn]);

  const handleShare = async () => {
    if (!film) {
      return;
    }

    try {
      await Share.share({
        message: prepareShareBody(film),
      });
    } catch (error) {
      NotificationStore.displayError(error as Error);
    }
  };

  const openBookmarks = () => {
    if (!isSignedIn) {
      NotificationStore.displayMessage(t('Sign In to an Account'));

      return;
    }

    openOverlay(bookmarksOverlayId);
  };

  const containerProps = () => ({
    film,
    thumbnailPoster,
    visibleScheduleItems: getVisibleScheduleItems(),
    playerVideoSelectorOverlayId,
    scheduleOverlayId,
    commentsOverlayId,
    bookmarksOverlayId,
  });

  const containerFunctions = {
    playFilm,
    hideVideoSelector,
    handleVideoSelect,
    handleSelectFilm,
    handleSelectActor,
    handleSelectCategory,
    handleUpdateScheduleWatch,
    handleShare,
    openBookmarks,
  };

  return withTV(FilmPageComponentTV, FilmPageComponent, {
    ...containerProps(),
    ...containerFunctions,
  });
}

export default FilmPageContainer;
