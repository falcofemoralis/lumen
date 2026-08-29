/* eslint-disable max-len */
import {
  completeHandler,
  createDownloadTask,
  DownloadTask,
  getExistingDownloadTasks,
} from '@kesha-antonov/react-native-background-downloader';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useConfigContext } from 'Context/ConfigContext';
import { Directory, File } from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import { t } from 'i18n/translate';
import { PLAYER_SCREEN } from 'Navigation/navigationRoutes';
import { useCallback, useEffect, useRef } from 'react';
import NotificationStore from 'Store/Notification.store';
import RouterStore from 'Store/Router.store';
import { DownloadFileInterface, DownloadFilmInterface } from 'Type/DownloadFile.interface';
import { FilmInterface } from 'Type/Film.interface';
import { FilmVideoInterface } from 'Type/FilmVideo.interface';
import { FilmVoiceInterface } from 'Type/FilmVoice.interface';
import { formatDestination, getDownloadsDir, TaskIdStorage } from 'Util/Download';
import { navigate } from 'Util/Navigation';
import { queryKeys } from 'Util/Query';

import { DownloadsScreenComponent } from './DownloadsScreen.component';
import { DownloadsScreenComponent as DownloadsScreenComponentTV } from './DownloadsScreen.component.atv';

export const DownloadsScreenContainer = () => {
  const { isTV, downloadsPath } = useConfigContext();
  const queryClient = useQueryClient();
  const completeTimeoutRef = useRef<number | null>(null);
  const downloadsQueryKey = queryKeys.downloads(downloadsPath);

  useEffect(() => () => {
    if (completeTimeoutRef.current) {
      clearTimeout(completeTimeoutRef.current);
    }
  }, []);

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

  const getFileDestination = useCallback((task: any): string => {
    return (task.destination ?? task.metadata?.destination ?? task.downloadParams?.destination ?? '') as string;
  }, []);

  const readExistingTasks = useCallback(async (): Promise<DownloadFileInterface[]> => {
    try {
      const tasks = await getExistingDownloadTasks();

      const files: DownloadFileInterface[] = [];
      const mapping = TaskIdStorage.load();
      tasks.forEach(task => {
        const destination = getFileDestination(task);
        if (!destination) {
          return;
        }

        const taskInfo = mapping[destination];
        if (!taskInfo) {
          return;
        }

        let additionalName = taskInfo.quality;

        if (taskInfo.episodeId && taskInfo.seasonId) {
          additionalName += ` - S${taskInfo.seasonId}E${taskInfo.episodeId}`;
        }

        // The native side only reports `destination` for some of its download
        // mechanisms, and never reports the source url -- both are kept in
        // TaskIdStorage, so put them on the task where the UI can read them.
        task.metadata = {
          ...task.metadata,
          name: additionalName,
          url: taskInfo.url,
          destination: taskInfo.destination,
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
  }, [getFileDestination]);

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

      // A file that is still downloading, or that a failed download left half
      // written, has nothing playable on disk yet
      if (file.task || file.isPartial) {
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

        voice.seasons?.sort((a, b) => Number(a.seasonId) - Number(b.seasonId));
        voice.seasons?.forEach(season => {
          season.episodes.sort((a, b) => Number(a.episodeId) - Number(b.episodeId));
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

  const { data: downloadedFilms = [], isLoading, refetch: scanFiles } = useQuery({
    queryKey: downloadsQueryKey,
    queryFn: async () => {
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

      return groupDownloadedFiles(merged);
    },
  });

  /** Patches the cached list after a task's own state changed, without a full rescan */
  const updateDownloadedFilms = useCallback(
    (updater: (films: DownloadFilmInterface[]) => DownloadFilmInterface[]) => {
      queryClient.setQueryData<DownloadFilmInterface[]>(
        queryKeys.downloads(downloadsPath),
        (prev) => (prev ? updater(prev) : prev)
      );
    },
    [queryClient, downloadsPath]
  );

  const handleVideoSelect = useCallback((film: FilmInterface, video: FilmVideoInterface, voice: FilmVoiceInterface, quality?: string) => {
    RouterStore.pushData(PLAYER_SCREEN, {
      video,
      film,
      voice,
      isOffline: true,
      quality,
    });

    navigate(PLAYER_SCREEN);
  }, []);

  const deleteFile = useCallback((task: DownloadTask) => {
    const destination = getFileDestination(task);
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
  }, [getFileDestination]);

  const completeTask = useCallback((task: DownloadTask) => {
    const destination = getFileDestination(task);

    // The file is whole now, so a rescan may offer it for playback
    if (destination) {
      TaskIdStorage.setComplete(destination);
    }

    if (completeTimeoutRef.current) {
      clearTimeout(completeTimeoutRef.current);
    }

    completeTimeoutRef.current = setTimeout(() => {
      scanFiles();
    }, 100);
  }, [scanFiles, getFileDestination]);

  const toggleTask = useCallback(async (taskId: string, isActive: boolean) => {
    const task = downloadedFilms.flatMap(film => film.tasks).find((tsk) => tsk.id === taskId);
    if (!task) {
      return;
    }

    try {
      if (isActive) {
        await task.resume();
      } else {
        await task.pause();
      }
    } catch (e) {
      NotificationStore.displayError(e as Error);

      throw e;
    }
  }, [downloadedFilms]);

  /**
   * Re-create a failed task so it can be run again. The native downloader picks the
   * partial file at the destination back up, so this continues from the last byte
   * rather than fetching the film again from zero.
   *
   * The returned task is NOT started: `done`/`error`/`progress` hold a single
   * handler each, so the caller has to attach its own before starting, or an
   * immediate failure would land on a task nothing is listening to.
   */
  const restartTask = useCallback((task: DownloadTask) => {
    const destination = getFileDestination(task);
    if (!destination) {
      NotificationStore.displayError('Destination not found');

      return null;
    }

    try {
      const mapping = TaskIdStorage.load();
      const taskInfo = mapping[destination];

      if (!taskInfo) {
        NotificationStore.displayError('Task info not found');

        return null;
      }

      const newTask = createDownloadTask({
        id: task.id,
        url: taskInfo.url,
        destination: taskInfo.destination,
        metadata: task.metadata,
      });

      updateDownloadedFilms(prev => prev.map(film => ({
        ...film,
        tasks: film.tasks.map(ft => ft.id === task.id ? newTask : ft),
      })));

      return newTask;
    } catch (e) {
      console.warn('Failed to start task', e);

      return null;
    }
  }, [getFileDestination, updateDownloadedFilms]);

  const deleteTask = useCallback(async (task: DownloadTask, isRefresh: boolean = true) => {
    const destination = getFileDestination(task);
    if (!destination) {
      NotificationStore.displayError('Destination not found');

      return;
    }

    await task.stop();
    await completeHandler(task.id);
    TaskIdStorage.clear(destination);
    deleteFile(task);

    if (isRefresh) {
      completeTask(task);
    }
  }, [deleteFile, completeTask, getFileDestination]);

  const deleteFilm = useCallback(async (item: DownloadFilmInterface) => {
    const { tasks, folder: destination } = item;

    for (const task of tasks) {
      await deleteTask(task, false);
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
    restartTask,
    deleteTask,
    deleteFilm,
    openFolder,
    handleRefresh,
    completeTask,
    toggleTask,
  };

  return isTV ? <DownloadsScreenComponentTV { ...containerProps } /> : <DownloadsScreenComponent { ...containerProps } />;
};

export default DownloadsScreenContainer;