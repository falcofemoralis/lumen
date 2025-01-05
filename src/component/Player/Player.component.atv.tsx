import Loader from 'Component/Loader';
import ThemedDropdown from 'Component/ThemedDropdown';
import ThemedIcon from 'Component/ThemedIcon';
import { IconPackType } from 'Component/ThemedIcon/ThemedIcon.type';
import ThemedText from 'Component/ThemedText';
import { LinearGradient } from 'expo-linear-gradient';
import { VideoView } from 'expo-video';
import React, {
  useEffect, useRef, useState,
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
import { scale } from 'Util/CreateStyles';
import RemoteControlManager from 'Util/RemoteControl/RemoteControlManager';
import { SupportedKeys } from 'Util/RemoteControl/SupportedKeys';

import {
  FocusedElement,
  LONG_PRESS_DURATION,
  QUALITY_OVERLAY_ID,
  RewindDirection,
} from './Player.config';
import { styles } from './Player.style.atv';
import { LongEvent, PlayerComponentProps } from './Player.type';

export function PlayerComponent({
  player,
  status,
  video,
  film,
  voice,
  selectedQuality,
  togglePlayPause,
  rewindPosition,
  rewindPositionAuto,
  openQualitySelector,
  handleQualityChange,
}: PlayerComponentProps) {
  const [focusedElement, setFocusedElement] = useState<FocusedElement>(
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

  const toggleSeekMode = () => {
    setHideActions(true);
    setShowControls(true);
  };

  const handleProgressThumbKeyDown = (key: SupportedKeys, direction: RewindDirection) => {
    const e = longEvent.current[key];

    if (!e.isKeyDownPressed) {
      e.isKeyDownPressed = true;
      e.longTimeout = setTimeout(() => {
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
      if (type === SupportedKeys.Enter && !showControls) {
        setShowControls(true);

        return true;
      }

      if (focusedElement === FocusedElement.ProgressThumb) {
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
      if (focusedElement === FocusedElement.ProgressThumb) {
        if (type === SupportedKeys.Left) {
          handleProgressThumbKeyUp(type, RewindDirection.Backward);
        }

        if (type === SupportedKeys.Right) {
          handleProgressThumbKeyUp(type, RewindDirection.Forward);
        }
      }

      return true;
    };

    const backAction = () => {
      if (showControls) {
        setShowControls(false);
        setHideActions(false);
        setFocusedElement(FocusedElement.ProgressThumb);

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
    action?: () => void,
  ) => (
    <SpatialNavigationFocusableView
      onSelect={ action }
      onFocus={ () => setFocusedElement(FocusedElement.Action) }
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

  const renderTopActions = () => (
    <SpatialNavigationView
      direction="horizontal"
      style={ {
        ...styles.controlsRow,
        ...(hideActions ? styles.controlsRowHidden : {}),
      } }
    >
      { renderAction(
        status.isPlaying ? 'pause' : 'play-arrow',
        'Play',
        togglePlayPause,
      ) }
      { renderAction('skip-previous', 'Previous') }
      { renderAction('skip-next', 'Next') }
      { renderAction('speed', 'Speed') }
      { renderAction('comment', 'Comments') }
    </SpatialNavigationView>
  );

  const renderProgressBar = () => (
    <View style={ styles.progressBarContainer }>
      { /* Playable Duration */ }
      <View
        style={ [
          styles.playableBar,
          { width: (`${status.playablePercentage}%`) as DimensionValue },
        ] }
      />
      { /* Progress Playback */ }
      <View
        style={ [
          styles.progressBar,
          { width: (`${status.progressPercentage}%`) as DimensionValue },
        ] }
      >
        { /* Progress Thumb */ }
        <SpatialNavigationFocusableView
          style={ styles.thumbContainer }
          onFocus={ () => setFocusedElement(FocusedElement.ProgressThumb) }
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

  const renderDuration = () => {
    const { currentTime, durationTime, remainingTime } = status;

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
  };

  const renderBottomActions = () => (
    <View style={ styles.bottomActions }>
      <SpatialNavigationView
        direction="horizontal"
        style={ {
          ...styles.controlsRow,
          ...(hideActions ? styles.controlsRowHidden : {}),
        } }
      >
        { renderAction('high-quality', 'Quality', openQualitySelector) }
        { renderAction('playlist-play', 'Series') }
        { renderAction('subtitles', 'Subtitles') }
        { renderAction('bookmarks', 'Bookmarks') }
        { renderAction('share', 'Share') }
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
        { renderTopActions() }
        <DefaultFocus>
          { renderProgressBar() }
        </DefaultFocus>
        { renderBottomActions() }
      </View>
    );
  };

  const renderQualitySelector = () => {
    const { streams } = video;

    return (
      <ThemedDropdown
        asOverlay
        overlayId={ QUALITY_OVERLAY_ID }
        searchPlaceholder="Quality"
        value={ selectedQuality }
        data={ streams.map((stream) => ({
          label: stream.quality,
          value: stream.quality,
        })) }
        onChange={ handleQualityChange }
      />
    );
  };

  const renderLoader = () => (
    <Loader
      isLoading={ status.isLoading }
      fullScreen
    />
  );

  const renderModals = () => renderQualitySelector();

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

export default PlayerComponent;
