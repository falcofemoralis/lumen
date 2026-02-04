import { useNavigation } from '@react-navigation/native';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { useConfigContext } from 'Context/ConfigContext';
import { useServiceContext } from 'Context/ServiceContext';
import { t } from 'i18n/translate';
import { PLAYER_SCREEN } from 'Navigation/navigationRoutes';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Share } from 'react-native';
import NotificationStore from 'Store/Notification.store';
import RouterStore from 'Store/Router.store';
import { FilmInterface } from 'Type/Film.interface';
import { FilmVideoInterface } from 'Type/FilmVideo.interface';
import { FilmVoiceInterface } from 'Type/FilmVoice.interface';
import { ScheduleItemInterface } from 'Type/ScheduleItem.interface';
import { navigate } from 'Util/Navigation';
import { prepareShareBody } from 'Util/Player';
import { openActor, openCategory, openFilm } from 'Util/Router';
import { updateUrlHost } from 'Util/Url';

import FilmScreenComponent from './FilmScreen.component';
import FilmScreenComponentTV from './FilmScreen.component.atv';
import { MINIMUM_SCHEDULE_ITEMS } from './FilmScreen.config';
import { FilmScreenContainerProps } from './FilmScreen.type';

export function FilmScreenContainer({ route }: FilmScreenContainerProps) {
  const { link, thumbnailPoster } = route.params as { link: string, thumbnailPoster: string };
  const { isTV } = useConfigContext();
  const navigation = useNavigation();
  const { isSignedIn, currentService } = useServiceContext();
  const [film, setFilm] = useState<FilmInterface | null>(null);
  const playerVideoSelectorOverlayRef = useRef<ThemedOverlayRef>(null);
  const scheduleOverlayRef = useRef<ThemedOverlayRef>(null);
  const commentsOverlayRef = useRef<ThemedOverlayRef>(null);
  const bookmarksOverlayRef = useRef<ThemedOverlayRef>(null);
  const descriptionOverlayRef = useRef<ThemedOverlayRef>(null);

  useEffect(() => {
    const loadFilm = async () => {
      try {
        const loadedFilm = await currentService.getFilm(link);

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

    playerVideoSelectorOverlayRef.current?.open();
  }, [film]);

  const handleVideoSelect = (video: FilmVideoInterface, voice: FilmVoiceInterface) => {
    playerVideoSelectorOverlayRef.current?.close();
    openPlayer(video, voice);
  };

  const playFilm = () => {
    if (!film) {
      return;
    }

    const { voices, hasVoices, hasSeasons } = film;

    if (voices.length <= 0) {
      NotificationStore.displayMessage(t('No video available'));

      return;
    }

    if (hasVoices || hasSeasons) {
      openVideoSelector();

      return;
    }

    const voice = voices[0];
    const { video } = voice;

    if (!video) {
      NotificationStore.displayMessage(t('No video streams available'));

      return;
    }

    if (isSignedIn) {
      currentService.saveWatch(film, voice)
        .catch((error) => {
          NotificationStore.displayError(error as Error);
        });
    }

    openPlayer(video, voice);
  };

  const openPlayer = (video: FilmVideoInterface, voice: FilmVoiceInterface) => {
    RouterStore.pushData(PLAYER_SCREEN, {
      video,
      film,
      voice,
    });

    navigate(PLAYER_SCREEN);
  };

  const handleSelectFilm = useCallback((f: FilmInterface) => {
    openFilm(f, navigation);
  }, [navigation]);

  const handleSelectActor = useCallback((actorLink: string) => {
    openActor(actorLink, navigation);
  }, [navigation]);

  const handleSelectCategory = useCallback((categoryLink: string) => {
    openCategory(categoryLink, navigation);
  }, [navigation]);

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
      currentService.saveScheduleWatch(id);
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
  }, [isSignedIn, currentService]);

  const handleShare = async () => {
    if (!film) {
      return;
    }

    const shareFilm = { ...film };

    if (currentService.isOfficialMode()) {
      shareFilm.link = updateUrlHost(shareFilm.link, currentService.officialShareLink);
    }

    try {
      await Share.share({
        message: prepareShareBody(shareFilm),
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

    bookmarksOverlayRef.current?.open();
  };

  const handleBookmarkChange = (f: FilmInterface) => {
    setFilm((prevFilm) => {
      if (!prevFilm) {
        return prevFilm;
      }

      return {
        ...prevFilm,
        bookmarks: f.bookmarks,
      };
    });
  };

  const containerProps = {
    film,
    thumbnailPoster,
    visibleScheduleItems: getVisibleScheduleItems(),
    playerVideoSelectorOverlayRef,
    scheduleOverlayRef,
    commentsOverlayRef,
    bookmarksOverlayRef,
    descriptionOverlayRef,
    playFilm,
    handleVideoSelect,
    handleSelectFilm,
    handleSelectActor,
    handleSelectCategory,
    handleUpdateScheduleWatch,
    handleShare,
    openBookmarks,
    handleBookmarkChange,
  };

  return isTV ? <FilmScreenComponentTV { ...containerProps } /> : <FilmScreenComponent { ...containerProps } />;
}

export default FilmScreenContainer;
