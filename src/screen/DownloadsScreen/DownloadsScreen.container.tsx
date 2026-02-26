/* eslint-disable max-len */
import {
  completeHandler,
  DownloadTask,
  getExistingDownloadTasks,
} from '@kesha-antonov/react-native-background-downloader';
import { useConfigContext } from 'Context/ConfigContext';
import { Directory, File } from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import { t } from 'i18n/translate';
import { PLAYER_SCREEN } from 'Navigation/navigationRoutes';
import { useCallback, useEffect, useState } from 'react';
import NotificationStore from 'Store/Notification.store';
import RouterStore from 'Store/Router.store';
import { DownloadFileInterface, DownloadFilmInterface } from 'Type/DownloadFile.interface';
import { FilmInterface } from 'Type/Film.interface';
import { FilmVideoInterface } from 'Type/FilmVideo.interface';
import { FilmVoiceInterface } from 'Type/FilmVoice.interface';
import { formatDestination, getDownloadsDir, TaskIdStorage } from 'Util/Download';
import { navigate } from 'Util/Navigation';

import { DownloadsScreenComponent } from './DownloadsScreen.component';
import { DownloadsScreenComponent as DownloadsScreenComponentTV } from './DownloadsScreen.component.atv';

export const DownloadsScreenContainer = () => {
  const { isTV, downloadsPath } = useConfigContext();
  const [downloadedFilms, setDownloadedFilms] = useState<DownloadFilmInterface[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const readStorage = useCallback((): DownloadFileInterface[] => {
    try {
      const downloadsDir = getDownloadsDir(downloadsPath);

      const files: DownloadFileInterface[] = [];
      const mapping = TaskIdStorage.load();

      const scanDirectory = (directory: any) => {
        const contents = directory.list();

        contents.forEach((item: any) => {
          if (item.constructor.name === 'Directory' || item.list) {
            scanDirectory(item);
          } else {
            const destination = formatDestination(item.uri);

            const taskInfo = mapping[destination];
            if (!taskInfo) {
              return;
            }

            files.push({
              ...taskInfo,
              bytesTotal: item.size,
            });
          }
        });
      };

      scanDirectory(new Directory(`file://${downloadsDir}`));

      return files;
    } catch (error) {
      console.warn('readStorage error:', error);

      return [];
    }
  }, [downloadsPath]);

  const readExistingTasks = useCallback(async (): Promise<DownloadFileInterface[]> => {
    try {
      const tasks = await getExistingDownloadTasks();

      const files: DownloadFileInterface[] = [];
      const mapping = TaskIdStorage.load();
      tasks.forEach(task => {
        const destination = task.metadata?.destination as string;
        if (!destination) {
          return;
        }

        const taskInfo = mapping[destination];
        if (!taskInfo) {
          return;
        }

        const additionalName = taskInfo.quality;

        if (taskInfo.episodeId && taskInfo.seasonId) {
          additionalName.concat(` - S${taskInfo.seasonId}E${taskInfo.episodeId}`);
        }

        task.metadata = {
          ...task.metadata,
          name: additionalName,
        };

        files.push({
          ...taskInfo,
          bytesTotal: task.bytesTotal,
          task,
        });
      });

      return files;
    } catch (e) {
      console.warn('getExistingDownloadTasks e', e);

      return [];
    }
  }, []);

  const groupDownloadedFiles = useCallback((files: DownloadFileInterface[]): DownloadFilmInterface[] => {
    const newDownloadedFiles: Record<string, DownloadFilmInterface> = {};

    files.forEach(file => {
      const filmId = file.film.id;

      // initialize film file
      if (!newDownloadedFiles[filmId]) {
        newDownloadedFiles[filmId] = {
          destination: file.destination,
          folder: file.folder,
          id: filmId,
          film: {
            ...file.film,
            voices: [],
          },
          bytesTotal: 0,
          tasks: [],
        };
      }

      if (file.task) {
        newDownloadedFiles[filmId].tasks.push(file.task);
      }

      if (file.bytesTotal) {
        const bytes = file.bytesTotal;

        if (newDownloadedFiles[filmId].bytesTotal !== undefined && newDownloadedFiles[filmId].bytesTotal !== null) {
          newDownloadedFiles[filmId].bytesTotal += bytes;
        }
      }

      const existingFilm = file.film;

      const fileVoiceId = file.voiceId;
      if (!fileVoiceId) {
        return;
      }

      const existingVoices: FilmVoiceInterface[] = newDownloadedFiles[filmId].film.voices;
      const existingVoiceIndex = existingVoices.findIndex(v => v.id === fileVoiceId);

      if (existingVoiceIndex === -1) {
        const filmVoice = existingFilm.voices?.find(v => v.id === file.voiceId);

        if (!filmVoice) {
          return;
        }

        existingVoices.push({
          ...filmVoice,
          seasons: [],
          video: { streams: [] },
        });
      }

      // do not add files that are still downloading
      if (file.task) {
        return;
      }

      const video: FilmVideoInterface = {
        streams: [{
          quality: file.quality,
          url: file.destination,
        }],
        subtitles: file.subtitles,
      };

      const voice = existingVoices.find(v => v.id === fileVoiceId);
      if (!voice) {
        return;
      }

      if (existingFilm.hasSeasons) {
        const seasonIndex = voice.seasons?.findIndex(s => s.seasonId === file.seasonId) ?? -1;

        if (seasonIndex === -1) {
          voice.seasons?.push({
            name: t('Season {{season}}', { season: file.seasonId }),
            seasonId: file.seasonId ?? '',
            episodes: [{
              name: t('Episode {{episode}}', { episode: file.episodeId }),
              episodeId: file.episodeId ?? '',
              video: video,
            }],
          });
        } else {
          const episodeIndex = voice.seasons![seasonIndex].episodes.findIndex(
            e => e.episodeId === file.episodeId
          );

          if (episodeIndex === -1) {
            voice.seasons![seasonIndex].episodes.push({
              name: t('Episode {{episode}}', { episode: file.episodeId }),
              episodeId: file.episodeId ?? '',
              video: video,
            });
          } else {
            voice.seasons![seasonIndex].episodes[episodeIndex].video?.streams.push(...video.streams);
          }
        }

        voice.seasons?.sort((a, b) => a.seasonId.localeCompare(b.seasonId));
        voice.seasons?.forEach(season => {
          season.episodes.sort((a, b) => a.episodeId.localeCompare(b.episodeId));
        });
      } else {
        voice.video?.streams.push(...video.streams);
      }
    });

    const filmFiles = Object.values(newDownloadedFiles);
    const mappedFilmFiles = filmFiles.map(filmFile => ({
      ...filmFile,
      film: {
        ...filmFile.film,
        hasVoices: filmFile.film.voices.length > 1,
      },
    } as DownloadFilmInterface));

    return mappedFilmFiles;
  }, []);

  const scanFiles = useCallback(async () => {
    setIsLoading(true);

    const files = readStorage();
    const tasks = await readExistingTasks();

    const merged = [...files];
    tasks.forEach(file => {
      const existingIndex = merged.findIndex(f => f.id === file.id);
      if (existingIndex !== -1) {
        merged[existingIndex] = {
          ...merged[existingIndex],
          ...file,
        };
      } else {
        merged.push(file);
      }
    });

    setDownloadedFilms(groupDownloadedFiles(merged));
    setIsLoading(false);
  }, [readExistingTasks, readStorage, groupDownloadedFiles]);

  useEffect(() => {
    scanFiles();
  }, [scanFiles]);

  const handleVideoSelect = useCallback((film: FilmInterface, video: FilmVideoInterface, voice: FilmVoiceInterface) => {
    RouterStore.pushData(PLAYER_SCREEN, {
      video,
      film,
      voice,
      isOffline: true,
    });

    navigate(PLAYER_SCREEN);
  }, []);

  const deleteFile = useCallback((task: DownloadTask) => {
    const destination = (task.metadata?.destination ?? task.downloadParams?.destination ?? '') as string;
    if (!destination) {
      NotificationStore.displayError('Destination not found');

      return;
    }

    try {
      const file = new File(`file://${destination}`);

      if (file.exists) {
        file.delete();
      }
    } catch (e) {
      NotificationStore.displayError(e as Error);
    }
  }, []);

  const restartTask = useCallback((task: DownloadTask) => {
    try {
      task.start();
    } catch (e) {
      console.warn('Failed to start task', e);
    }
  }, []);

  const deleteTask = useCallback(async (task: DownloadTask) => {
    const destination = (task.metadata?.destination ?? task.downloadParams?.destination ?? '') as string;
    if (!destination) {
      NotificationStore.displayError('Destination not found');

      return;
    }

    await task.stop();
    await completeHandler(task.id);
    TaskIdStorage.clear(destination);
    deleteFile(task);
  }, [deleteFile]);

  const deleteFilm = useCallback(async (item: DownloadFilmInterface) => {
    const { tasks, folder: destination } = item;

    for (const task of tasks) {
      await deleteTask(task);
    }

    try {
      const folder = new Directory(`file://${destination}`);

      if (folder.exists) {
        folder.delete();
      }
    } catch (e) {
      NotificationStore.displayError(e as Error);
    }

    scanFiles();
  }, [scanFiles, deleteTask]);

  const openFolder = useCallback(async (_folderPath: string) => {
    IntentLauncher.startActivityAsync(
      'android.intent.action.VIEW_DOWNLOADS'
    );
  }, []);

  const handleRefresh = useCallback(async (isRefresh: boolean) => {
    if (!isRefresh) {
      return;
    }

    scanFiles();
  }, [scanFiles]);

  const containerProps = {
    downloadedFilms,
    isLoading,
    handleVideoSelect,
    deleteFile,
    restartTask,
    deleteTask,
    deleteFilm,
    openFolder,
    handleRefresh,
  };

  return isTV ? <DownloadsScreenComponentTV { ...containerProps } /> : <DownloadsScreenComponent { ...containerProps } />;
};

export default DownloadsScreenContainer;