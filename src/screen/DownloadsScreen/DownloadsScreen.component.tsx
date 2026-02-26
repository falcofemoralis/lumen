import { DownloadTask } from '@kesha-antonov/react-native-background-downloader';
import { InfoBlock } from 'Component/InfoBlock';
import { Loader } from 'Component/Loader';
import { Page } from 'Component/Page';
import { PlayerVideoSelector } from 'Component/PlayerVideoSelector';
import { PlayerVideoSelectorRef } from 'Component/PlayerVideoSelector/PlayerVideoSelector.container';
import { ThemedGrid } from 'Component/ThemedGrid';
import { ThemedGridRowProps } from 'Component/ThemedGrid/ThemedGrid.type';
import { ThemedImage } from 'Component/ThemedImage';
import { ThemedOverlay } from 'Component/ThemedOverlay';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { ThemedPressable } from 'Component/ThemedPressable';
import { ThemedSimpleList } from 'Component/ThemedSimpleList';
import { ListItem } from 'Component/ThemedSimpleList/ThemedSimpleList.type';
import { ThemedText } from 'Component/ThemedText';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import { EllipsisVertical, Pause, Play, RotateCcw, Trash2 } from 'lucide-react-native';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { Slider } from 'react-native-awesome-slider';
import Animated, { FadeOut, LinearTransition, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from 'Theme/context';
import { DownloadFilmInterface } from 'Type/DownloadFile.interface';
import { FilmInterface } from 'Type/Film.interface';
import { FilmVideoInterface } from 'Type/FilmVideo.interface';
import { FilmVoiceInterface } from 'Type/FilmVoice.interface';
import { formatBytes } from 'Util/Download';

import { NUMBER_OF_COLUMNS } from './DownloadsScreen.config';
import { componentStyles } from './DownloadsScreen.style';
import { DownloadsScreenComponentProps } from './DownloadsScreen.type';

const DownloadItemTask = ({
  task,
  styles,
  completeTask,
  pauseTask,
  resumeTask,
  deleteTask,
  deleteFile,
  restartTask,
}: {
  task: DownloadTask
  styles: ReturnType<typeof componentStyles>
  completeTask: (taskId: string) => void
  pauseTask: (taskId: string) => void
  resumeTask: (taskId: string) => void
  deleteTask: (task: DownloadTask) => void
  deleteFile: (task: DownloadTask) => void;
  restartTask: (task: DownloadTask) => void;
}) => {
  const { scale, theme } = useAppTheme();
  const isAttachedRef = useRef(false);
  const [downloaded, setDownloaded] = useState(0);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [progressPercentage, setProgressPercentage] = useState(0);

  const progress = useSharedValue(0);
  const minimumValue = useSharedValue(0);
  const maximumValue = useSharedValue(100);

  const {
    metadata: { taskFileName } = {},
  } = task as DownloadTask & { metadata?: { taskFileName?: string } };

  useEffect(() => {
    if (!task) {
      return;
    }

    if (!isAttachedRef.current) {
      task
        .progress(({ bytesDownloaded, bytesTotal }) => {
          const percentage = (bytesDownloaded / bytesTotal) * 100;
          progress.value = percentage;
          setProgressPercentage(Math.floor(percentage));
          setDownloaded(bytesDownloaded);
          setTotal(bytesTotal);
        })
        .done(() => {
          completeTask(task.id);
        })
        .error(({ error: err }) => {
          deleteFile(task);
          setError(err);
        });

      isAttachedRef.current = true;
    }
  }, [task]);

  const renderContent = () => {
    return (
      <View>
        { taskFileName && (
          <ThemedText>
            { taskFileName }
          </ThemedText>
        ) }
        <ThemedText>
          { `${formatBytes(downloaded)}/${formatBytes(total)}` }
        </ThemedText>
        <ThemedText>
          { `${progressPercentage.toFixed(2)}%` }
        </ThemedText>
        { error && (
          <ThemedText style={ styles.error }>
            { error }
          </ThemedText>
        ) }
      </View>
    );
  };

  const renderActions = () => {
    return (
      <View style={ styles.taskActions }>
        { error && (
          <ThemedPressable
            style={ styles.actionsBtn }
            onPress={ () => restartTask(task) }
          >
            <RotateCcw
              size={ scale(24) }
              color={ theme.colors.icon }
            />
          </ThemedPressable>
        ) }
        <ThemedPressable
          style={ styles.actionsBtn }
          onPress={ () => {
            deleteTask(task);
            completeTask(task.id);
          } }
        >
          <Trash2
            size={ scale(24) }
            color={ theme.colors.icon }
          />
        </ThemedPressable>
        { task.state === 'PAUSED' ? (
          <ThemedPressable
            style={ styles.actionsBtn }
            onPress={ () => resumeTask(task.id) }
          >
            <Play
              size={ scale(24) }
              color={ theme.colors.icon }
            />
          </ThemedPressable>
        ) : (
          <ThemedPressable
            style={ styles.actionsBtn }
            onPress={ () => pauseTask(task.id) }
          >
            <Pause
              size={ scale(24) }
              color={ theme.colors.icon }
            />
          </ThemedPressable>
        ) }
      </View>
    );
  };

  const renderProgressBar = () => {
    return (
      <Slider
        progress={ progress }
        minimumValue={ minimumValue }
        maximumValue={ maximumValue }
        style={ styles.progressBar }
        theme={ {
          minimumTrackTintColor: theme.colors.secondary,
          maximumTrackTintColor: '#8B8B8B',
          bubbleBackgroundColor: theme.colors.secondary,
        } }
        thumbWidth={ 0 }
        disableTapEvent
        disableTrackFollow
        disableTrackPress
      />
    );
  };

  return (
    <Animated.View
      key={ task.id }
      exiting={ FadeOut }
      layout={ LinearTransition }
      style={ styles.taskContainer }
    >
      <View>
        <View style={ styles.taskContent }>
          { renderContent() }
          { renderActions() }
        </View>
        { renderProgressBar() }
      </View>
    </Animated.View>
  );
};

const DownloadItem = ({
  index,
  item,
  styles,
  onSelect,
  deleteTask,
  deleteFilm,
  openFolder,
  handleRefresh,
  deleteFile,
  restartTask,
}: {
  index: number
  item: DownloadFilmInterface
  styles: ReturnType<typeof componentStyles>
  onSelect: (film: FilmInterface, video: FilmVideoInterface, voice: FilmVoiceInterface) => void;
  deleteFile: (task: DownloadTask) => void;
  restartTask: (task: DownloadTask) => void;
  deleteTask: (task: DownloadTask) => void;
  deleteFilm: (item: DownloadFilmInterface) => void;
  openFolder: (destination: string) => void;
  handleRefresh: (isRefresh: boolean) => Promise<void>;
}) => {
  const playerVideoSelectorOverlayRef = useRef<PlayerVideoSelectorRef>(null);
  const actionsOverlayRef = useRef<ThemedOverlayRef>(null);

  const {
    film: {
      poster,
      originalTitle,
      title,
    },
    folder,
    bytesTotal,
    tasks,
  } = item;
  const { scale, theme } = useAppTheme();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleActions = useCallback((action: ListItem) => {
    if (action.value === 'open') {
      openFolder(folder);
    } else if (action.value === 'delete') {
      deleteFilm(item);
    }

    actionsOverlayRef.current?.close();
  }, [item, openFolder, deleteFilm]);

  const handleSelect = useCallback((video: FilmVideoInterface, voice: FilmVoiceInterface) => {
    onSelect(item.film, video, voice);
    playerVideoSelectorOverlayRef.current?.close();
  }, [item, onSelect]);

  const completeTask = useCallback((taskId: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      handleRefresh(true);
    }, 50);
  }, [handleRefresh]);

  const pauseTask = useCallback(async (taskId: string) => {
    const task = tasks.find((tsk) => tsk.id === taskId);
    if (task) {
      await task.pause();
    }

    setTimeout(() => {
      handleRefresh(true);
    }, 50);
  }, [handleRefresh, tasks]);

  const resumeTask = useCallback(async (taskId: string) => {
    const task = tasks.find((tsk) => tsk.id === taskId);
    if (task) {
      await task.resume();
    }

    setTimeout(() => {
      handleRefresh(true);
    }, 50);
  }, [handleRefresh, tasks]);

  const renderPlayerVideoSelector = () => {
    const { film } = item;

    return (
      <PlayerVideoSelector
        ref={ playerVideoSelectorOverlayRef }
        film={ film }
        onSelect={ handleSelect }
        isOffline
      />
    );
  };

  const renderActionsOverlay = () => {
    return (
      <ThemedOverlay ref={ actionsOverlayRef }>
        <View style={ styles.overlayActions }>
          <ThemedSimpleList
            data={ [
              {
                label: t('Open folder'),
                value: 'open',
              },
              {
                label: t('Delete'),
                value: 'delete',
              },
            ] }
            onChange={ handleActions }
          />
        </View>
      </ThemedOverlay>
    );
  };

  const renderPoster = () => {
    return (
      <ThemedImage
        style={ styles.poster }
        src={ `file://${poster}` }
        cachePolicy='none'
      />
    );
  };

  const renderContent = () => {
    return (
      <View style={ styles.cardContent }>
        <ThemedText style={ styles.title }>
          { title }
        </ThemedText>
        <ThemedText>
          { originalTitle }
        </ThemedText>
        <ThemedText>
          { formatBytes(bytesTotal || 0) }
        </ThemedText>
      </View>
    );
  };

  const renderActionsBtn = () => {
    return (
      <ThemedPressable
        style={ styles.actionsBtn }
        onPress={ () => actionsOverlayRef.current?.open() }
      >
        <EllipsisVertical
          size={ scale(24) }
          color={ theme.colors.icon }
        />
      </ThemedPressable>
    );
  };

  return (
    <View style={ [styles.item, index !== 0 && styles.itemBorder] }>
      { renderPlayerVideoSelector() }
      { renderActionsOverlay() }
      <ThemedPressable
        contentStyle={ styles.cardContainer }
        onPress={
          () => playerVideoSelectorOverlayRef.current?.open()
        }
      >
        <View style={ styles.card }>
          { renderPoster() }
          { renderContent() }
          { renderActionsBtn() }
        </View>
      </ThemedPressable>
      <View style={ styles.tasks }>
        { tasks.map((task) => (
          <DownloadItemTask
            key={ task.id }
            task={ task }
            styles={ styles }
            completeTask={ completeTask }
            pauseTask={ pauseTask }
            resumeTask={ resumeTask }
            deleteTask={ deleteTask }
            deleteFile={ deleteFile }
            restartTask={ restartTask }
          />
        )) }
      </View>
    </View>
  );
};

export const MemoizedDownloadItem = memo(DownloadItem);

export const DownloadsScreenComponent = ({
  downloadedFilms,
  isLoading,
  handleVideoSelect,
  deleteFile,
  deleteTask,
  restartTask,
  deleteFilm,
  openFolder,
  handleRefresh,
}: DownloadsScreenComponentProps) => {
  const { scale } = useAppTheme();
  const { top } = useSafeAreaInsets();
  const styles = useThemedStyles(componentStyles);

  const renderHeader = useCallback(() => {
    return <View style={ { height: top } } />;
  }, [top]);

  const renderItem = useCallback(({ item, index }: ThemedGridRowProps<DownloadFilmInterface>) => {
    return (
      <MemoizedDownloadItem
        item={ item }
        onSelect={ handleVideoSelect }
        styles={ styles }
        index={ index }
        openFolder={ openFolder }
        deleteFile={ deleteFile }
        restartTask={ restartTask }
        deleteTask={ deleteTask }
        deleteFilm={ deleteFilm }
        handleRefresh={ handleRefresh }
      />
    );
  }, [styles, handleVideoSelect, openFolder, deleteFilm, deleteTask]);

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <Loader
          isLoading
          fullScreen
        />
      );
    }

    return (
      <View style={ styles.empty }>
        <InfoBlock
          title={ t('No downloads') }
          subtitle={ t('You have not downloaded any films yet') }
        />
      </View>
    );
  };

  return (
    <Page>
      <ThemedGrid
        data={ downloadedFilms }
        numberOfColumns={ NUMBER_OF_COLUMNS }
        itemSize={ scale(130) }
        renderItem={ renderItem }
        ListHeaderComponent={ renderHeader }
        ListEmptyComponent={ renderEmpty }
        onNextLoad={ handleRefresh }
      />
    </Page>
  );
};
