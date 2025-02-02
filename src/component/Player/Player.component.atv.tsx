import Loader from 'Component/Loader';
import PlayerVideoSelector from 'Component/PlayerVideoSelector';
import ThemedDropdown from 'Component/ThemedDropdown';
import ThemedIcon from 'Component/ThemedIcon';
import { IconPackType } from 'Component/ThemedIcon/ThemedIcon.type';
import ThemedText from 'Component/ThemedText';
import { LinearGradient } from 'expo-linear-gradient';
import { VideoView } from 'expo-video';
import { observer } from 'mobx-react-lite';
import React, {
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  BackHandler,
  DimensionValue,
  View,
} from 'react-native';
import {
  DefaultFocus,
  SpatialNavigationFocusableView,
  SpatialNavigationView,
} from 'react-tv-space-navigation';
import OverlayStore from 'Store/Overlay.store';
import { scale } from 'Util/CreateStyles';
import { setTimeoutSafe } from 'Util/Misc';
import RemoteControlManager from 'Util/RemoteControl/RemoteControlManager';
import { SupportedKeys } from 'Util/RemoteControl/SupportedKeys';

import {
  FocusedElement,
  IN_PLAYER_VIDEO_SELECTOR_OVERLAY_ID,
  LONG_PRESS_DURATION,
  PLAYER_CONTROLS_TIMEOUT,
  QUALITY_OVERLAY_ID,
  RewindDirection,
} from './Player.config';
import PlayerStore from './Player.store';
import { styles } from './Player.style.atv';
import { LongEvent, PlayerComponentProps } from './Player.type';

export function PlayerComponent({
  player,
  isLoading,
  isPlaying,
  video,
  film,
  voice,
  selectedQuality,
  togglePlayPause,
  rewindPosition,
  rewindPositionAuto,
  openQualitySelector,
  handleQualityChange,
  handleNewEpisode,
  openVideoSelector,
  handleVideoSelect,
  hideVideoSelector,
}: PlayerComponentProps) {
  const focusedElementRef = useRef<FocusedElement>(
    FocusedElement.ProgressThumb,
  );
  const [showControls, setShowControls] = useState(false);
  const [hideActions, setHideActions] = useState(false);
  const longEvent = useRef<{[key: string]: LongEvent}>({
    [SupportedKeys.Left]: {
      isKeyDownPressed: false,
      longTimeout: null,
      isLongFired: false,
    },
    [SupportedKeys.Right]: {
      isKeyDownPressed: false,
      longTimeout: null,
      isLongFired: false,
    },
  });
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);
  const canHideControls = useRef(isPlaying && showControls);

  useEffect(() => () => {
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
  }, []);

  useEffect(() => {
    canHideControls.current = isPlaying && showControls;
  }, [isPlaying, showControls]);

  useEffect(() => {
    canHideControls.current = isPlaying && showControls && !OverlayStore.currentOverlay.length;

    if (canHideControls.current) {
      handleUserInteraction();
    }
  }, [OverlayStore.currentOverlay.length]);

  const setControlsTimeout = () => {
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }

    controlsTimeout.current = setTimeoutSafe(() => {
      if (canHideControls.current) {
        setShowControls(false);
      }
    }, PLAYER_CONTROLS_TIMEOUT);
  };

  const handleUserInteraction = (action?: () => void) => {
    setControlsTimeout();

    if (action) {
      action();
    }
  };

  const toggleSeekMode = () => {
    setHideActions(true);
    setShowControls(true);
  };

  const handleProgressThumbKeyDown = (key: SupportedKeys, direction: RewindDirection) => {
    const e = longEvent.current[key];

    if (!e.isKeyDownPressed) {
      e.isKeyDownPressed = true;
      e.longTimeout = setTimeoutSafe(() => {
        // Long button press
        rewindPositionAuto(direction);
        toggleSeekMode();
        e.longTimeout = null;
        e.isLongFired = true;
      }, LONG_PRESS_DURATION);
    }

    return true;
  };

  const handleProgressThumbKeyUp = (key: SupportedKeys, direction: RewindDirection) => {
    const e = longEvent.current[key];
    e.isKeyDownPressed = false;

    if (e.isLongFired) {
      // Long button unpress
      e.isLongFired = false;
      rewindPositionAuto(direction);
      toggleSeekMode();
    }

    if (e.longTimeout) {
      // Button press
      clearTimeout(e.longTimeout);
      rewindPosition(direction);
      toggleSeekMode();
    }
  };

  useEffect(() => {
    const keyDownListener = (type: SupportedKeys) => {
      if (!showControls) {
        if (type === SupportedKeys.Back) {
          return false;
        }

        if (type === SupportedKeys.Up) {
          focusedElementRef.current = FocusedElement.TopAction;
        }

        if (type === SupportedKeys.Enter
          || type === SupportedKeys.Left
          || type === SupportedKeys.Right
        ) {
          focusedElementRef.current = FocusedElement.ProgressThumb;
        }

        if (type === SupportedKeys.Down) {
          focusedElementRef.current = FocusedElement.BottomAction;
        }

        setShowControls(true);

        return true;
      }

      if (focusedElementRef.current === FocusedElement.ProgressThumb) {
        if (type === SupportedKeys.Enter) {
          togglePlayPause();
        }

        if (type === SupportedKeys.Left) {
          handleProgressThumbKeyDown(type, RewindDirection.Backward);
        }

        if (type === SupportedKeys.Right) {
          handleProgressThumbKeyDown(type, RewindDirection.Forward);
        }

        if ((type === SupportedKeys.Up || type === SupportedKeys.Down) && hideActions) {
          setHideActions(false);
        }
      }

      return false;
    };

    const keyUpListener = (type: SupportedKeys) => {
      if (focusedElementRef.current === FocusedElement.ProgressThumb) {
        if (type === SupportedKeys.Left) {
          handleProgressThumbKeyUp(type, RewindDirection.Backward);
        }

        if (type === SupportedKeys.Right) {
          handleProgressThumbKeyUp(type, RewindDirection.Forward);
        }

        handleUserInteraction();
      }

      return true;
    };

    const backAction = () => {
      if (showControls) {
        setShowControls(false);
        setHideActions(false);

        return true;
      }

      return false;
    };

    const remoteControlDownListener = RemoteControlManager.addKeydownListener(keyDownListener);
    const remoteControlUpListener = RemoteControlManager.addKeyupListener(keyUpListener);

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => {
      backHandler.remove();
      RemoteControlManager.removeKeydownListener(remoteControlDownListener);
      RemoteControlManager.removeKeyupListener(remoteControlUpListener);
    };
  });

  const renderTitle = () => {
    const { title, hasSeasons } = film;

    return (
      <ThemedText style={ styles.title }>
        {
          `${title}${hasSeasons ? ` Сезон ${voice.lastSeasonId} - Эпизод ${voice.lastEpisodeId}` : ''}`
        }
      </ThemedText>
    );
  };

  const renderSubtitle = () => {
    const { releaseDate, countries, ratings } = film;

    return (
      <ThemedText style={ styles.subtitle }>
        {
          `${releaseDate} • ${ratings ? ratings[0].text : ''} • ${countries ? countries[0] : ''}`
        }
      </ThemedText>
    );
  };

  const renderTopInfo = () => {
    if (hideActions) {
      return null;
    }

    return (
      <View style={ styles.topInfo }>
        { renderTitle() }
        { renderSubtitle() }
      </View>
    );
  };

  const renderAction = (
    icon: string,
    _name: string,
    el: FocusedElement,
    action?: () => void,
  ) => (
    <SpatialNavigationFocusableView
      onSelect={ action }
      onFocus={ () => handleUserInteraction(() => { focusedElementRef.current = el; }) }
    >
      { ({ isFocused }) => (
        <ThemedIcon
          style={ [
            styles.action,
            isFocused && styles.focusedAction,
          ] }
          icon={ {
            name: icon,
            pack: IconPackType.MaterialIcons,
          } }
          size={ scale(30) }
          color="white"
        />
      ) }
    </SpatialNavigationFocusableView>
  );

  const renderTopAction = (
    icon: string,
    name: string,
    action?: () => void,
  ) => renderAction(
    icon,
    name,
    FocusedElement.TopAction,
    action,
  );

  const renderBottomAction = (
    icon: string,
    name: string,
    action?: () => void,
  ) => renderAction(
    icon,
    name,
    FocusedElement.BottomAction,
    action,
  );

  const renderTopActions = () => (
    <SpatialNavigationView
      direction="horizontal"
      style={ {
        ...styles.controlsRow,
        ...(hideActions ? styles.controlsRowHidden : {}),
      } }
    >
      { renderTopAction(
        isPlaying ? 'pause' : 'play-arrow',
        'Play',
        togglePlayPause,
      ) }
      { renderTopAction('fast-rewind', 'Rewind') }
      { renderTopAction('fast-forward', 'Forward') }
      { film.hasSeasons && (
        <>
          { renderTopAction('skip-previous', 'Previous', () => handleNewEpisode(RewindDirection.Backward)) }
          { renderTopAction('skip-next', 'Next', () => handleNewEpisode(RewindDirection.Forward)) }
        </>
      ) }
      { renderTopAction('speed', 'Speed') }
      { renderTopAction('comment', 'Comments') }
    </SpatialNavigationView>
  );

  const renderProgressBar = () => (
    <ProgressBar
      onFocus={ () => {
        focusedElementRef.current = FocusedElement.ProgressThumb;
      } }
    />
  );

  const renderDuration = () => (
    <Duration />
  );

  const renderBottomActions = () => (
    <View style={ styles.bottomActions }>
      <SpatialNavigationView
        direction="horizontal"
        style={ {
          ...styles.controlsRow,
          ...(hideActions ? styles.controlsRowHidden : {}),
        } }
      >
        { renderBottomAction('high-quality', 'Quality', openQualitySelector) }
        { renderBottomAction('playlist-play', 'Series', openVideoSelector) }
        { renderBottomAction('subtitles', 'Subtitles') }
        { renderBottomAction('bookmarks', 'Bookmarks') }
        { renderBottomAction('share', 'Share') }
      </SpatialNavigationView>
      { renderDuration() }
    </View>
  );

  const renderBackground = () => {
    if (!showControls) {
      return null;
    }

    return (
      <LinearGradient
        style={ styles.background }
        colors={ ['rgba(0, 0, 0, 0.6)', 'transparent'] }
        start={ { x: 0, y: 1 } }
        end={ { x: 0, y: 0 } }
      />
    );
  };

  const renderControls = () => {
    if (!showControls) {
      return null;
    }

    return (
      <View style={ styles.controls }>
        { renderTopInfo() }
        <DefaultFocus enable={ focusedElementRef.current === FocusedElement.TopAction }>
          { renderTopActions() }
        </DefaultFocus>
        <DefaultFocus enable={ focusedElementRef.current === FocusedElement.ProgressThumb }>
          { renderProgressBar() }
        </DefaultFocus>
        <DefaultFocus enable={ focusedElementRef.current === FocusedElement.BottomAction }>
          { renderBottomActions() }
        </DefaultFocus>
      </View>
    );
  };

  const renderLoader = () => (
    <Loader
      isLoading={ isLoading }
      fullScreen
    />
  );

  const renderQualitySelector = () => {
    const { streams } = video;

    return (
      <ThemedDropdown
        asOverlay
        overlayId={ QUALITY_OVERLAY_ID }
        header="Quality"
        value={ selectedQuality }
        data={ streams.map((stream) => ({
          label: stream.quality,
          value: stream.quality,
        })) }
        onChange={ handleQualityChange }
      />
    );
  };

  const renderPlayerVideoSelector = () => {
    const { voices = [], hasVoices, hasSeasons } = film;

    if (!voices.length || (!hasVoices && !hasSeasons)) {
      return null;
    }

    return (
      <PlayerVideoSelector
        overlayId={ IN_PLAYER_VIDEO_SELECTOR_OVERLAY_ID }
        film={ film }
        onHide={ hideVideoSelector }
        onSelect={ handleVideoSelect }
      />
    );
  };

  const renderModals = () => (
    <>
      { renderQualitySelector() }
      { renderPlayerVideoSelector() }
    </>
  );

  return (
    <View style={ styles.container }>
      <VideoView
        style={ styles.video }
        player={ player }
        contentFit="contain"
        nativeControls={ false }
        allowsPictureInPicture={ false }
      />
      { renderBackground() }
      { renderControls() }
      { renderLoader() }
      { renderModals() }
    </View>
  );
}

export const Duration = observer(() => {
  const {
    currentTime,
    durationTime,
    remainingTime,
  } = PlayerStore.progressStatus;

  return (
    <View style={ styles.duration }>
      <ThemedText style={ styles.durationText }>
        { `Remaining: ${remainingTime}` }
      </ThemedText>
      <ThemedText style={ styles.durationText }>
        { `${currentTime} / ${durationTime}` }
      </ThemedText>
    </View>
  );
});

export const ProgressBar = observer(({
  onFocus,
}: {onFocus: () => void}) => {
  const {
    playablePercentage,
    progressPercentage,
  } = PlayerStore.progressStatus;

  return (
    <View style={ styles.progressBarContainer }>
      { /* Playable Duration */ }
      <View
        style={ [
          styles.playableBar,
          { width: (`${playablePercentage}%`) as DimensionValue },
        ] }
      />
      { /* Progress Playback */ }
      <View
        style={ [
          styles.progressBar,
          { width: (`${progressPercentage}%`) as DimensionValue },
        ] }
      >
        { /* Progress Thumb */ }
        <SpatialNavigationFocusableView
          style={ styles.thumbContainer }
          onFocus={ onFocus }
        >
          { ({ isFocused }) => (
            <View
              style={ [
                styles.thumb,
                isFocused && styles.focusedThumb,
              ] }
            />
          ) }
        </SpatialNavigationFocusableView>
      </View>
    </View>
  );
});

export default PlayerComponent;
