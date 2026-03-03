import {
  completeHandler,
  createDownloadTask,
} from '@kesha-antonov/react-native-background-downloader';
import { useNavigation } from '@react-navigation/native';
import { PlayerVideoSelectorRef } from 'Component/PlayerVideoSelector/PlayerVideoSelector.container';
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
import { DownloadLinkInterface } from 'Type/DownloadLink.interface';
import { FilmInterface } from 'Type/Film.interface';
import { FilmVideoInterface } from 'Type/FilmVideo.interface';
import { FilmVoiceInterface } from 'Type/FilmVoice.interface';
import { ScheduleItemInterface } from 'Type/ScheduleItem.interface';
import { getDownloadsDir, normalizeName, TaskIdStorage, uuid } from 'Util/Download';
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
  const { isTV, downloadsPath, downloadsSaveSubtitles, downloadsSavePoster } = useConfigContext();
  const navigation = useNavigation();
  const { isSignedIn, currentService } = useServiceContext();
  const [film, setFilm] = useState<FilmInterface | null>(null);
  const playerVideoSelectorOverlayRef = useRef<PlayerVideoSelectorRef>(null);
  const scheduleOverlayRef = useRef<ThemedOverlayRef>(null);
  const commentsOverlayRef = useRef<ThemedOverlayRef>(null);
  const bookmarksOverlayRef = useRef<ThemedOverlayRef>(null);
  const descriptionOverlayRef = useRef<ThemedOverlayRef>(null);
  const playerVideoDownloaderOverlayRef = useRef<PlayerVideoSelectorRef>(null);

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

  const handleVideoSelect = (video: FilmVideoInterface, voice: FilmVoiceInterface) => {
    RouterStore.pushData(PLAYER_SCREEN, {
      video,
      film,
      voice,
    });

    navigate(PLAYER_SCREEN);

    playerVideoSelectorOverlayRef.current?.close();
  };

  const openVideoDownloader = useCallback(async () => {
    if (!film) {
      return;
    }

    playerVideoDownloaderOverlayRef.current?.open();
  }, [film]);

  const playFilm = () => {
    if (!film) {
      return;
    }

    const { voices } = film;

    if (voices.length <= 0) {
      NotificationStore.displayMessage(t('No video available'));

      return;
    }

    playerVideoSelectorOverlayRef.current?.open();
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
      // shareFilm.link = updateUrlHost(shareFilm.link, currentService.officialShareLink);
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

  const handleDownloadSelect = async (links: DownloadLinkInterface[]) => {
    if (!film) {
      return;
    }

    const { id, title, poster } = film;
    const filmName = [normalizeName(title), id];
    const folderName = filmName.join('-');
    const folderPath = `${getDownloadsDir(downloadsPath)}/${folderName}`;

    const posterExtension = poster.split('.').pop()?.split('?')[0] || 'jpg';
    const posterDestination = `${folderPath}/poster.${posterExtension}`;

    if (downloadsSavePoster) {
      const posterTask = createDownloadTask({
        id: uuid(),
        url: poster,
        destination: posterDestination,
        metadata: {
          groupId: id,
          groupName: title,
        },
      })
        .done(() => {
          completeHandler(posterTask.id);
        })
        .error(({ error }) => {
          NotificationStore.displayError(error);
          completeHandler(posterTask.id);
        });

      posterTask.start();
    }

    links.forEach((linkItem) => {
      const { url, quality, subtitles = [], seasonId, episodeId, voice } = linkItem;
      const taskName = [];

      if (seasonId) {
        taskName.push(`S${seasonId}`);
      }

      if (episodeId) {
        taskName.push(`E${episodeId}`);
      }

      taskName.push(quality);

      const name = [...taskName, ...filmName].join('-');
      const taskUrl = url.replace(':hls:manifest.m3u8', '');
      const extension = taskUrl.split('.').pop();
      const destination = `${folderPath}/${name}.${extension}`;

      const allSubtitles = [];
      if (downloadsSaveSubtitles) {
        const subtitleLinks = subtitles.map((subtitle) => {
          const { url: subtitleUrl, languageCode } = subtitle;

          if (!languageCode) {
            return {
              ...subtitle,
              originalUrl: null,
            };
          }

          const subtitleExtension = subtitleUrl.split('.').pop()?.split('?')[0] || 'vtt';
          const subtitleDestination = `${folderPath}/${name}-${languageCode}.${subtitleExtension}`;

          return {
            ...subtitle,
            url: subtitleDestination,
            originalUrl: subtitleUrl,
          };
        });

        allSubtitles.push(...subtitleLinks);

        subtitleLinks.forEach((subtitle) => {
          const { url: subtitleDestination, originalUrl: subtitleUrl } = subtitle;

          // ignore "off" subtitle
          if (!subtitleUrl) {
            return;
          }

          const subtitleTask = createDownloadTask({
            id: uuid(),
            url: subtitleUrl,
            destination: subtitleDestination,
            metadata: {
              groupId: id,
              groupName: title,
            },
          })
            .done(() => {
              completeHandler(subtitleTask.id);
            })
            .error(({ error }) => {
              NotificationStore.displayError(error);
              completeHandler(subtitleTask.id);
            });

          subtitleTask.start();
        });
      }

      const task = createDownloadTask({
        id: TaskIdStorage.getOrCreate(destination, {
          url: taskUrl,
          destination,
          folder: folderPath,
          film: {
            id,
            link: film.link,
            type: film.type,
            poster: posterDestination,
            title: film.title,
            originalTitle: film.originalTitle,
            releaseDate: film.releaseDate,
            countries: film.countries,
            genres: film.genres,
            voices: film.voices,
            hasVoices: film.hasVoices,
            hasSeasons: film.hasSeasons,
          },
          quality,
          subtitles: allSubtitles,
          seasonId,
          episodeId,
          voiceId: voice?.id,
        }),
        url: taskUrl,
        destination,
        metadata: {
          taskFileName: taskName.join(' '),
          destination,
          groupId: id,
          groupName: title,
        },
      })
        .done(() => {
          completeHandler(task.id);
        })
        .error(({ error }) => {
          NotificationStore.displayError(error ?? t('Download failed'));
          completeHandler(task.id);
        });

      task.start();
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
    playerVideoDownloaderOverlayRef,
    playFilm,
    handleVideoSelect,
    handleSelectFilm,
    handleSelectActor,
    handleSelectCategory,
    handleUpdateScheduleWatch,
    handleShare,
    openBookmarks,
    handleBookmarkChange,
    openVideoDownloader,
    handleDownloadSelect,
  };

  return isTV ? <FilmScreenComponentTV { ...containerProps } /> : <FilmScreenComponent { ...containerProps } />;
}

export default FilmScreenContainer;
