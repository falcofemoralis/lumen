import { DownloadTask } from '@kesha-antonov/react-native-background-downloader';
import { InfoBlock } from 'Component/InfoBlock';
import { Loader } from 'Component/Loader';
import { Page } from 'Component/Page';
import { PlayerVideoSelector } from 'Component/PlayerVideoSelector';
import { PlayerVideoSelectorRef } from 'Component/PlayerVideoSelector/PlayerVideoSelector.container';
import { ThemedButton } from 'Component/ThemedButton';
import { ThemedGrid } from 'Component/ThemedGrid';
import { ThemedGridRowProps } from 'Component/ThemedGrid/ThemedGrid.type';
import { ThemedImage } from 'Component/ThemedImage';
import { ThemedOverlay } from 'Component/ThemedOverlay';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { ThemedPressable } from 'Component/ThemedPressable';
import { ThemedSimpleList } from 'Component/ThemedSimpleList';
import { ListItem } from 'Component/ThemedSimpleList/ThemedSimpleList.type';
import { ThemedText } from 'Component/ThemedText';
import { useLayout } from 'Hooks/useLayout';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import { EllipsisVertical, Pause, Play, RotateCcw, Trash2 } from 'lucide-react-native';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { Slider } from 'react-native-awesome-slider';
import Animated, { FadeOut, LinearTransition, useSharedValue } from 'react-native-reanimated';
import { DefaultFocus, SpatialNavigationView } from 'react-tv-space-navigation';
import { useAppTheme } from 'Theme/context';
import { ThemedStyles } from 'Theme/types';
import { DownloadFilmInterface } from 'Type/DownloadFile.interface';
import { FilmVideoInterface } from 'Type/FilmVideo.interface';
import { FilmVoiceInterface } from 'Type/FilmVoice.interface';
import { formatBytes } from 'Util/Download';

import { NUMBER_OF_COLUMNS_TV } from './DownloadsScreen.config';
import { componentStyles } from './DownloadsScreen.style.atv';
import { DownloadItemProps, DownloadItemTaskProps, DownloadsScreenComponentProps } from './DownloadsScreen.type';

const DownloadItemTask = ({
  task,
  styles,
  deleteTask,
  deleteFile,
  restartTask,
  toggleTask,
  completeTask,
}: DownloadItemTaskProps & { styles: ThemedStyles<typeof componentStyles> }) => {
  const { theme } = useAppTheme();
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

  const processTask = (taskArg: DownloadTask) => {
    taskArg
      .progress(({ bytesDownloaded, bytesTotal }) => {
        const percentage = (bytesDownloaded / bytesTotal) * 100;
        // eslint-disable-next-line react-compiler/react-compiler
        progress.value = percentage;
        setProgressPercentage(Math.floor(percentage));
        setDownloaded(bytesDownloaded);
        setTotal(bytesTotal);
      })
      .done(() => {
        completeTask(task);
      })
      .error(({ error: err }) => {
        deleteFile(task);
        setError(err ?? t('Download failed'));
        setDownloaded(0);
        setTotal(0);
        setProgressPercentage(0);
        progress.value = 0;
      });
  };

  useEffect(() => {
    processTask(task);
  }, []);

  const handleTaskRestart = () => {
    setError(null);
    const newTask = restartTask(task);
    if (newTask) {
      processTask(newTask);
    }
  };

  const renderContent = () => {
    return (
      <ThemedPressable>
        { ({ isFocused }) => {
          return (
            <Animated.View
              style={ [
                styles.taskRowContent,
                isFocused && styles.taskRowContentFocused,
              ] }
            >
              { taskFileName && (
                <ThemedText
                  style={ isFocused && styles.taskRowTextFocused }
                >
                  { taskFileName }
                </ThemedText>
              ) }
              <ThemedText style={ isFocused && styles.taskRowTextFocused }>
                { `${formatBytes(downloaded)}/${formatBytes(total)}` }
              </ThemedText>
              <ThemedText style={ isFocused && styles.taskRowTextFocused }>
                { `${progressPercentage.toFixed(2)}%` }
              </ThemedText>
              { error && (
                <ThemedText style={ styles.error }>
                  { error }
                </ThemedText>
              ) }
            </Animated.View>
          );
        } }
      </ThemedPressable>
    );
  };

  const renderToggleActions = () => {
    if (task.state === 'FAILED') {
      return null;
    }

    return task.state === 'PAUSED' ? (
      <ThemedButton
        style={ styles.actionsBtn }
        onPress={ () => toggleTask(task.id, true) }
        IconComponent={ Play }
        withAnimation
      />
    ) : (
      <ThemedButton
        style={ styles.actionsBtn }
        onPress={ () => toggleTask(task.id, false) }
        IconComponent={ Pause }
        withAnimation
      />
    );
  };

  const renderActions = () => {
    return (
      <View style={ styles.taskActions }>
        { error && (
          <ThemedButton
            style={ styles.actionsBtn }
            onPress={ handleTaskRestart }
            IconComponent={ RotateCcw }
            withAnimation
          />
        ) }
        <ThemedButton
          style={ styles.actionsBtn }
          onPress={ () => deleteTask(task) }
          IconComponent={ Trash2 }
          withAnimation
        />
        { renderToggleActions() }
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
      <SpatialNavigationView
        direction="horizontal"
        style={ [
          styles.taskRow,
        ] }
      >
        <View style={ styles.taskContent }>
          { renderContent() }
          { renderActions() }
        </View>
      </SpatialNavigationView>
      { renderProgressBar() }
    </Animated.View>
  );
};

const DownloadItem = (props: DownloadItemProps & { styles: ThemedStyles<typeof componentStyles> }) => {
  const {
    item,
    styles,
    openFolder,
    deleteFilm,
    handleVideoSelect,
  } = props;
  const { width: containerWidth } = useLayout();
  const playerVideoSelectorOverlayRef = useRef<PlayerVideoSelectorRef>(null);
  const actionsOverlayRef = useRef<ThemedOverlayRef>(null);
  const tasksOverlayRef = useRef<ThemedOverlayRef>(null);

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
  const handleActions = useCallback((action: ListItem) => {
    if (action.value === 'open') {
      openFolder(folder);
      actionsOverlayRef.current?.close();
    } else if (action.value === 'delete') {
      deleteFilm(item);
      actionsOverlayRef.current?.close();
    } else if (action.value === 'tasks') {
      tasksOverlayRef.current?.open();
    }
  }, [item, folder, openFolder, deleteFilm]);

  const handleSelect = useCallback((video: FilmVideoInterface, voice: FilmVoiceInterface) => {
    handleVideoSelect(item.film, video, voice);
    playerVideoSelectorOverlayRef.current?.close();
  }, [item, handleVideoSelect]);

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
              {
                label: t('See active tasks'),
                value: 'tasks',
              },
            ] }
            value='open'
            onChange={ handleActions }
          />
        </View>
        { renderTasksOverlay() }
      </ThemedOverlay>
    );
  };

  const renderPoster = (isFocused: boolean) => {
    return (
      <View style={ [styles.poster, styles.posterContainer, isFocused && styles.posterContainerFocused] }>
        <ThemedImage
          style={ styles.poster }
          src={ `file://${poster}` }
          cachePolicy='none'
        />
      </View>
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
      <ThemedButton
        style={ styles.actionsBtn }
        onPress={ () => actionsOverlayRef.current?.open() }
        IconComponent={ EllipsisVertical }
        withAnimation
      />
    );
  };

  const renderTasksOverlayContent = () => {
    if (!tasks.length) {
      return (
        <InfoBlock
          title={ t('No active tasks') }
          subtitle={ t('You have no active tasks') }
        />
      );
    }

    return (
      <DefaultFocus>
        <View style={ styles.tasks }>
          { tasks.map((task) => (
            <DownloadItemTask
              { ...props }
              key={ task.id }
              task={ task }
              styles={ styles }
            />
          )) }
        </View>
      </DefaultFocus>
    );
  };

  const renderTasksOverlay = () => {
    return (
      <ThemedOverlay ref={ tasksOverlayRef }>
        { renderTasksOverlayContent() }
      </ThemedOverlay>
    );
  };

  return (
    <SpatialNavigationView
      direction="horizontal"
      alignInGrid
      style={ [
        styles.rowStyle,
        { width: containerWidth },
      ] }
    >
      <ThemedPressable
        onPress={ () => playerVideoSelectorOverlayRef.current?.open() }
      >
        { ({ isFocused }) => {
          return (
            <Animated.View
              style={ [
                styles.item,
                isFocused && styles.itemFocused,
              ] }
            >
              { renderPlayerVideoSelector() }
              { renderActionsOverlay() }
              <View
                style={ [
                  styles.card,
                  { width: containerWidth * 0.6 },
                ] }
              >
                { renderPoster(isFocused) }
                { renderContent() }
              </View>
            </Animated.View>
          );
        } }
      </ThemedPressable>
      { renderActionsBtn() }
    </SpatialNavigationView>
  );
};

export const MemoizedDownloadItem = memo(DownloadItem);

export const DownloadsScreenComponent = (props: DownloadsScreenComponentProps) => {
  const {
    downloadedFilms,
    isLoading,
    handleRefresh,
  } = props;
  const { theme } = useAppTheme();
  const styles = useThemedStyles(componentStyles);

  const renderItem = useCallback(({ item, index }: ThemedGridRowProps<DownloadFilmInterface>) => {
    return (
      <MemoizedDownloadItem
        { ...props }
        index={ index }
        item={ item }
        styles={ styles }
      />
    );
  }, [styles, props]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <Loader
          isLoading
          fullScreen
        />
      );
    }

    if (!downloadedFilms.length) {
      return (
        <View style={ styles.empty }>
          <InfoBlock
            title={ t('No downloads') }
            subtitle={ t('You have not downloaded any films yet') }
          />
        </View>
      );
    }

    return (
      <DefaultFocus>
        <ThemedGrid
          style={ styles.grid }
          rowStyle={ styles.rowStyle }
          data={ downloadedFilms }
          numberOfColumns={ NUMBER_OF_COLUMNS_TV }
          itemSize={ theme.dimensions.height / 3 }
          renderItem={ renderItem }
          onNextLoad={ handleRefresh }
          tvOptimized
        />
      </DefaultFocus>
    );
  };

  return (
    <Page>
      { renderContent() }
    </Page>
  );
};
