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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import NotificationStore from 'Store/Notification.store';
import { useAppTheme } from 'Theme/context';
import { ThemedStyles } from 'Theme/types';
import { DownloadFilmInterface } from 'Type/DownloadFile.interface';
import { FilmVideoInterface } from 'Type/FilmVideo.interface';
import { FilmVoiceInterface } from 'Type/FilmVoice.interface';
import { copyToClipboard } from 'Util/Clipboard';
import { formatBytes, getDownloadErrorMessage, hasDownloadedVideo } from 'Util/Download';

import { NUMBER_OF_COLUMNS } from './DownloadsScreen.config';
import { componentStyles } from './DownloadsScreen.style';
import { DownloadItemProps, DownloadItemTaskProps, DownloadsScreenComponentProps } from './DownloadsScreen.type';

const DownloadItemTask = ({
  task,
  styles,
  deleteTask,
  restartTask,
  toggleTask,
  completeTask,
}: DownloadItemTaskProps & { styles: ThemedStyles<typeof componentStyles> }) => {
  const { scale, theme } = useAppTheme();
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
      .error(({ error: err, errorCode }) => {
        // The partial file deliberately stays on disk. The native downloader has
        // already spent its retry window reconnecting before reporting this, and
        // restarting resumes from the last byte instead of re-fetching the film
        // from zero -- so the progress shown here stays put too.
        setError(getDownloadErrorMessage(err, errorCode));
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
      // Handlers first: restartTask hands the task over unstarted for this reason
      processTask(newTask);
      newTask.start();
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

  const renderContent = () => {
    return (
      <View style={ styles.taskInfo }>
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

  // A source url is long enough to blow the row's layout apart, so it lives in
  // an overlay of its own where it can wrap, be selected and be copied.
  const renderSourceOverlay = () => {
    if (!url) {
      return null;
    }

    return (
      <ThemedOverlay ref={ sourceOverlayRef }>
        <View style={ styles.sourceOverlay }>
          <ThemedText style={ styles.sourceTitle }>
            { t('Download link') }
          </ThemedText>
          { /* containerStyle, not style: `style` lands on the scroll view's
               inner content view, where a maxHeight would clip the url instead
               of letting it scroll. */ }
          <ThemedScrollView containerStyle={ styles.sourceScroll }>
            <ThemedText selectable>
              { url }
            </ThemedText>
          </ThemedScrollView>
          <ThemedButton
            title={ t('Copy link') }
            IconComponent={ Copy }
            onPress={ handleCopySource }
          />
        </View>
      </ThemedOverlay>
    );
  };

  const renderToggleActions = () => {
    if (error) {
      return null;
    }

    return isPaused ? (
      <ThemedPressable
        style={ styles.actionsBtn }
        onPress={ () => handleToggle(true) }
      >
        <Play
          size={ scale(24) }
          color={ theme.colors.icon }
        />
      </ThemedPressable>
    ) : (
      <ThemedPressable
        style={ styles.actionsBtn }
        onPress={ () => handleToggle(false) }
      >
        <Pause
          size={ scale(24) }
          color={ theme.colors.icon }
        />
      </ThemedPressable>
    );
  };

  const renderActions = () => {
    return (
      <View style={ styles.taskActions }>
        { error && (
          <ThemedPressable
            style={ styles.actionsBtn }
            onPress={ handleTaskRestart }
          >
            <RotateCcw
              size={ scale(24) }
              color={ theme.colors.icon }
            />
          </ThemedPressable>
        ) }
        { url && (
          <ThemedPressable
            style={ styles.actionsBtn }
            onPress={ () => sourceOverlayRef.current?.open() }
          >
            <Link
              size={ scale(24) }
              color={ theme.colors.icon }
            />
          </ThemedPressable>
        ) }
        <ThemedPressable
          style={ styles.actionsBtn }
          onPress={ () => deleteTask(task) }
        >
          <Trash2
            size={ scale(24) }
            color={ theme.colors.icon }
          />
        </ThemedPressable>
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

const DownloadItem = (props: DownloadItemProps & { styles: ThemedStyles<typeof componentStyles> }) => {
  const {
    index,
    item,
    styles,
    openFolder,
    deleteFilm,
    handleVideoSelect,
  } = props;
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
      openFolder(folder);
    } else if (action.value === 'delete') {
      deleteFilm(item);
    }

    actionsOverlayRef.current?.close();
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
        onPress={ handlePress }
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
            { ...props }
            key={ task.id }
            task={ task }
            styles={ styles }
          />
        )) }
      </View>
    </View>
  );
};

export const MemoizedDownloadItem = memo(DownloadItem);

export const DownloadsScreenComponent = (props: DownloadsScreenComponentProps) => {
  const {
    downloadedFilms,
    isLoading,
    handleRefresh,
  } = props;
  const { top } = useSafeAreaInsets();
  const styles = useThemedStyles(componentStyles);

  const renderHeader = useCallback(() => {
    return <View style={ { height: top } } />;
  }, [top]);

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
    <Page checkConnection={ false }>
      <ThemedGrid
        data={ downloadedFilms }
        numberOfColumns={ NUMBER_OF_COLUMNS }
        renderItem={ renderItem }
        ListHeaderComponent={ renderHeader }
        ListEmptyComponent={ renderEmpty }
        onNextLoad={ handleRefresh }
      />
    </Page>
  );
};
