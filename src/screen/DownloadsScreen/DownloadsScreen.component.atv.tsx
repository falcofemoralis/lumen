import { DownloadTask } from '@kesha-antonov/react-native-background-downloader';
import { FocusContext, useFocusable } from '@noriginmedia/norigin-spatial-navigation-react-native-tvos';
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
import { ThemedScrollView } from 'Component/ThemedScrollView';
import { ThemedSimpleList } from 'Component/ThemedSimpleList';
import { ListItem } from 'Component/ThemedSimpleList/ThemedSimpleList.type';
import { ThemedText } from 'Component/ThemedText';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import Copy from 'lucide-react-native/icons/copy';
import EllipsisVertical from 'lucide-react-native/icons/ellipsis-vertical';
import Link from 'lucide-react-native/icons/link';
import Pause from 'lucide-react-native/icons/pause';
import Play from 'lucide-react-native/icons/play';
import RotateCcw from 'lucide-react-native/icons/rotate-ccw';
import Trash2 from 'lucide-react-native/icons/trash-2';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { Slider } from 'react-native-awesome-slider';
import Animated, { FadeOut, LinearTransition, useSharedValue } from 'react-native-reanimated';
import NotificationStore from 'Store/Notification.store';
import { useAppTheme } from 'Theme/context';
import { ThemedStyles } from 'Theme/types';
import { DownloadFilmInterface } from 'Type/DownloadFile.interface';
import { FilmVideoInterface } from 'Type/FilmVideo.interface';
import { FilmVoiceInterface } from 'Type/FilmVoice.interface';
import { copyToClipboard } from 'Util/Clipboard';
import { formatBytes, hasDownloadedVideo } from 'Util/Download';

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
  // `task.state` is mutated in place by the downloader, and the task object the
  // list holds keeps its identity across a pause/resume -- so a render never
  // picks the change up. Mirror the state the screen cares about here instead.
  const [isPaused, setIsPaused] = useState(task.state === 'PAUSED');
  const sourceOverlayRef = useRef<ThemedOverlayRef>(null);

  const progress = useSharedValue(0);
  const minimumValue = useSharedValue(0);
  const maximumValue = useSharedValue(100);

  const {
    metadata: { taskFileName, url } = {},
  } = task as DownloadTask & { metadata?: { taskFileName?: string, url?: string } };

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
    setIsPaused(false);
    const newTask = restartTask(task);
    if (newTask) {
      processTask(newTask);
    }
  };

  const handleToggle = async (isActive: boolean) => {
    setIsPaused(!isActive);

    try {
      await toggleTask(task.id, isActive);
    } catch {
      setIsPaused(isActive);
    }
  };

  const handleCopySource = () => {
    if (!url) {
      return;
    }

    copyToClipboard(url);
    NotificationStore.displayMessage(t('Link copied'));
  };

  // A source url is long enough to blow the task row apart, so it lives in an
  // overlay of its own where it can wrap and be copied.
  const renderSourceOverlay = () => {
    if (!url) {
      return null;
    }

    return (
      <ThemedOverlay ref={ sourceOverlayRef } containerStyle={ styles.sourceOverlayContainer }>
        <View style={ styles.sourceOverlay }>
          <ThemedText style={ styles.sourceTitle }>
            { t('Download link') }
          </ThemedText>
          { /* Deliberately not a ThemedScrollView: on TV it forces height 100%
               on itself, which pushes the copy button out of the overlay's
               clipped content box -- and it can only be scrolled by focusing a
               child, which plain text never is. Cap the lines instead; the point
               of the overlay is to copy the link, not to read all of it. */ }
          <ThemedText
            style={ styles.sourceText }
            numberOfLines={ 6 }
          >
            { url }
          </ThemedText>
          <ThemedButton
            autofocus
            title={ t('Copy link') }
            IconComponent={ Copy }
            onPress={ handleCopySource }
          />
        </View>
      </ThemedOverlay>
    );
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
    if (error) {
      return null;
    }

    return isPaused ? (
      <ThemedButton
        style={ styles.actionsBtn }
        onPress={ () => handleToggle(true) }
        IconComponent={ Play }
      />
    ) : (
      <ThemedButton
        style={ styles.actionsBtn }
        onPress={ () => handleToggle(false) }
        IconComponent={ Pause }
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
          />
        ) }
        { url && (
          <ThemedButton
            style={ styles.actionsBtn }
            onPress={ () => sourceOverlayRef.current?.open() }
            IconComponent={ Link }
          />
        ) }
        <ThemedButton
          style={ styles.actionsBtn }
          onPress={ () => deleteTask(task) }
          IconComponent={ Trash2 }
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
      { renderSourceOverlay() }
      <View style={ styles.taskRow }>
        <View style={ styles.taskContent }>
          { renderContent() }
          { renderActions() }
        </View>
      </View>
      { renderProgressBar() }
    </Animated.View>
  );
};

// The zoom is applied to the row -- not to the item -- so it also covers the
// gap and grows the row as one block. `hasFocusedChild` keeps it applied while
// focus moves between the item and the actions button, and the button
// counter-scales so it keeps its fixed square size.
const DownloadItem = (props: DownloadItemProps & { styles: ThemedStyles<typeof componentStyles> }) => {
  const {
    item,
    styles,
    openFolder,
    deleteFilm,
    handleVideoSelect,
    deleteTask,
  } = props;
  const { ref, focusKey, hasFocusedChild } = useFocusable<object, View>({
    trackChildren: true,
    saveLastFocusedChild: false,
  });
  const playerVideoSelectorOverlayRef = useRef<PlayerVideoSelectorRef>(null);
  const actionsOverlayRef = useRef<ThemedOverlayRef>(null);
  const tasksOverlayRef = useRef<ThemedOverlayRef>(null);
  const { scale } = useAppTheme();

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

  // Files that are still downloading are not part of the film's voices yet, so
  // there is nothing to hand to the player -- tell the user to wait instead of
  // opening an empty selector.
  const isPlayable = hasDownloadedVideo(item);

  const handlePress = useCallback(() => {
    if (!isPlayable) {
      NotificationStore.displayMessage(t('Film is still downloading'));

      return;
    }

    playerVideoSelectorOverlayRef.current?.open();
  }, [isPlayable]);

  const handleActions = useCallback((action: ListItem) => {
    if (action.value === 'open') {
      actionsOverlayRef.current?.close();
      openFolder(folder);
    } else if (action.value === 'delete') {
      actionsOverlayRef.current?.close();
      deleteFilm(item);
    } else if (action.value === 'tasks') {
      tasksOverlayRef.current?.open();
    }
  }, [item, folder, openFolder, deleteFilm]);

  const handleSelect = useCallback((video: FilmVideoInterface, voice: FilmVoiceInterface) => {
    handleVideoSelect(item.film, video, voice);
    playerVideoSelectorOverlayRef.current?.close();
  }, [item, handleVideoSelect]);

  // Deleting one of several tasks leaves the list worth looking at, so keep the
  // overlays up and let the row drop out of it. Only the last task takes the
  // overlays down with it -- what is left behind then is an empty-state block.
  const handleDeleteTask = useCallback((task: DownloadTask) => {
    deleteTask(task);

    if (tasks.length > 1) {
      return;
    }

    tasksOverlayRef.current?.close();
    actionsOverlayRef.current?.close();
  }, [deleteTask, tasks.length]);

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

  const renderTasksOverlayContent = () => {
    if (!tasks.length) {
      return (
        <InfoBlock
          title={ t('No active tasks') }
          subtitle={ t('You have no active tasks') }
        />
      );
    }

    // A film downloading a whole season has more task rows than the overlay can
    // show. The scroll view is driven by child focus, which the rows' own action
    // buttons provide, and needs a bounded height of its own to scroll at all --
    // the overlay's maxHeight is a percentage the scroll view cannot resolve
    // against, so without this the rows just spill out of the clipped box.
    return (
      <ThemedScrollView
        style={ styles.tasks }
        containerStyle={ styles.tasksScroll }
      >
        { tasks.map((task) => (
          <DownloadItemTask
            { ...props }
            key={ task.id }
            task={ task }
            styles={ styles }
            deleteTask={ handleDeleteTask }
          />
        )) }
      </ThemedScrollView>
    );
  };

  const renderTasksOverlay = () => {
    return (
      <ThemedOverlay ref={ tasksOverlayRef } containerStyle={ styles.tasksOverlay }>
        { renderTasksOverlayContent() }
      </ThemedOverlay>
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

  const renderContent = (isFocused: boolean) => {
    return (
      <Animated.View
        style={ [
          styles.fill,
          styles.item,
          isFocused && styles.itemFocused,
        ] }
      >
        <View style={ [styles.poster, styles.posterContainer, isFocused && styles.posterContainerFocused] }>
          <ThemedImage
            style={ styles.poster }
            src={ `file://${poster}` }
            cachePolicy='none'
          />
        </View>
        <View style={ styles.itemContent }>
          <ThemedText style={ styles.title }>
            { title }
          </ThemedText>
          <ThemedText>
            { originalTitle }
          </ThemedText>
          <ThemedText>
            { formatBytes(bytesTotal || 0) }
          </ThemedText>
          { tasks.length > 0 && (
            <View style={ styles.downloading }>
              <Loader isLoading />
              <ThemedText>
                { t('Downloading') }
              </ThemedText>
            </View>
          ) }
        </View>
      </Animated.View>
    );
  };

  return (
    <FocusContext.Provider value={ focusKey }>
      <Animated.View
        ref={ ref }
        style={ [styles.row, hasFocusedChild && styles.rowFocused] }
        tvFocusable={ false }
      >
        { renderPlayerVideoSelector() }
        { renderActionsOverlay() }
        <ThemedPressable
          style={ styles.fill }
          contentStyle={ styles.fill }
          onPress={ handlePress }
        >
          { ({ isFocused }) => renderContent(isFocused) }
        </ThemedPressable>
        <ThemedButton
          style={ [styles.actionButton, hasFocusedChild && styles.actionButtonUnzoomed] }
          contentStyle={ styles.actionButtonContent }
          IconComponent={ EllipsisVertical }
          onPress={ () => actionsOverlayRef.current?.open() }
          iconProps={ {
            size: scale(20),
          } }
        />
      </Animated.View>
    </FocusContext.Provider>
  );
};

export const MemoizedDownloadItem = memo(DownloadItem);

export const DownloadsScreenComponent = (props: DownloadsScreenComponentProps) => {
  const {
    downloadedFilms,
    isLoading,
    handleRefresh,
  } = props;
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
          <ThemedButton
            title={ t('Refresh downloads') }
            autofocus
            style={ styles.refreshBtn }
            onPress={ () => handleRefresh(true) }
          />
        </View>
      );
    }

    return (
      <ThemedGrid
        autofocus
        style={ styles.grid }
        rowStyle={ styles.rowStyle }
        data={ downloadedFilms }
        numberOfColumns={ NUMBER_OF_COLUMNS_TV }
        renderItem={ renderItem }
        onNextLoad={ handleRefresh }
        scrollBehavior='stick-to-center'
      />
    );
  };

  return (
    <Page checkConnection={ false }>
      { renderContent() }
    </Page>
  );
};
