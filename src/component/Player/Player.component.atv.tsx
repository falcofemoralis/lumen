import Loader from 'Component/Loader';
import PlayerDuration from 'Component/PlayerDuration';
import PlayerProgressBar from 'Component/PlayerProgressBar';
import PlayerSubtitles from 'Component/PlayerSubtitles';
import PlayerVideoSelector from 'Component/PlayerVideoSelector';
import ThemedDropdown from 'Component/ThemedDropdown';
import ThemedIcon from 'Component/ThemedIcon';
import { IconPackType } from 'Component/ThemedIcon/ThemedIcon.type';
import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
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
  View,
} from 'react-native';
import { runOnJS, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import {
  DefaultFocus,
  SpatialNavigationFocusableView,
  SpatialNavigationNodeRef,
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
  PLAYER_CONTROLS_ANIMATION,
  PLAYER_CONTROLS_TIMEOUT,
  QUALITY_OVERLAY_ID,
  RewindDirection,
  SUBTITLE_OVERLAY_ID,
} from './Player.config';
import PlayerStore from './Player.store';
import { styles } from './Player.style.atv';
import { PlayerComponentProps } from './Player.type';

export function PlayerComponent({
  player,
  isLoading,
  isPlaying,
  video,
  film,
  voice,
  selectedQuality,
  selectedSubtitle,
  togglePlayPause,
  rewindPosition,
  openQualitySelector,
  handleQualityChange,
  handleNewEpisode,
  openVideoSelector,
  handleVideoSelect,
  hideVideoSelector,
  openSubtitleSelector,
  handleSubtitleChange,
  calculateCurrentTime,
  seekToPosition,
}: PlayerComponentProps) {
  const [showControls, setShowControls] = useState(false);
  const [hideActions, setHideActions] = useState(false);
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);
  const canHideControls = useRef(isPlaying && showControls);
  const topActionRef = useRef<SpatialNavigationNodeRef | null>(null);
  const middleActionRef = useRef<SpatialNavigationNodeRef | null>(null);
  const bottomActionRef = useRef<SpatialNavigationNodeRef | null>(null);

  const controlsAnimation = useAnimatedStyle(() => ({
    opacity: withTiming(
      showControls ? 1 : 0,
      { duration: PLAYER_CONTROLS_ANIMATION },
      (finished) => {
        if (!showControls && hideActions && finished) {
          runOnJS(setHideActions)(false);
        }
      },
    ),
  }));

  useEffect(() => () => {
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
  }, []);

  useEffect(() => {
    canHideControls.current = isPlaying && showControls && !OverlayStore.currentOverlay.length;
  }, [isPlaying, showControls]);

  useEffect(() => {
    canHideControls.current = isPlaying && showControls && !OverlayStore.currentOverlay.length;

    // popup was closed, trigger controls timeout
    if (canHideControls.current) {
      handleUserInteraction();
    }
  }, [OverlayStore.currentOverlay.length]);

  useEffect(() => {
    const keyDownListener = (type: SupportedKeys) => {
      if (!showControls) {
        if (type === SupportedKeys.Back) {
          return false;
        }

        if (type === SupportedKeys.Up) {
          PlayerStore.setFocusedElement(FocusedElement.TopAction);
          topActionRef.current?.focus();
        }

        if (type === SupportedKeys.Enter
          || type === SupportedKeys.Left
          || type === SupportedKeys.Right
        ) {
          PlayerStore.setFocusedElement(FocusedElement.ProgressThumb);
          middleActionRef.current?.focus();

          if (type === SupportedKeys.Left || type === SupportedKeys.Right) {
            return true;
          }
        }

        if (type === SupportedKeys.Down) {
          PlayerStore.setFocusedElement(FocusedElement.BottomAction);
          bottomActionRef.current?.focus();
        }

        setShowControls(true);

        return true;
      }

      if (PlayerStore.focusedElement === FocusedElement.ProgressThumb) {
        if (type === SupportedKeys.Enter) {
          togglePlayPause();
        }

        if ((type === SupportedKeys.Up || type === SupportedKeys.Down) && hideActions) {
          setHideActions(false);
        }
      }

      return false;
    };

    const backAction = () => {
      if (showControls) {
        setShowControls(false);
        // setHideActions(false);

        return true;
      }

      return false;
    };

    const remoteControlDownListener = RemoteControlManager.addKeydownListener(keyDownListener);

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => {
      backHandler.remove();
      RemoteControlManager.removeKeydownListener(remoteControlDownListener);
    };
  });

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
    ref?: React.LegacyRef<SpatialNavigationNodeRef>,
  ) => (
    <SpatialNavigationFocusableView
      ref={ ref }
      onSelect={ () => handleUserInteraction(action) }
      onFocus={ () => handleUserInteraction(() => { PlayerStore.setFocusedElement(el); }) }
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
    ref?: React.LegacyRef<SpatialNavigationNodeRef>,
  ) => renderAction(
    icon,
    name,
    FocusedElement.TopAction,
    action,
    ref,
  );

  const renderBottomAction = (
    icon: string,
    name: string,
    action?: () => void,
    ref?: React.LegacyRef<SpatialNavigationNodeRef>,
  ) => renderAction(
    icon,
    name,
    FocusedElement.BottomAction,
    action,
    ref,
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
        topActionRef,
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

  const renderProgressBar = () => {
    const { storyboardUrl } = video;

    return (
      <PlayerProgressBar
        player={ player }
        storyboardUrl={ storyboardUrl }
        calculateCurrentTime={ calculateCurrentTime }
        seekToPosition={ seekToPosition }
        thumbRef={ middleActionRef }
        onFocus={ () => {
          PlayerStore.setFocusedElement(FocusedElement.ProgressThumb);
        } }
        toggleSeekMode={ toggleSeekMode }
        rewindPosition={ rewindPosition }
        handleUserInteraction={ handleUserInteraction }
        togglePlayPause={ togglePlayPause }
        hideActions={ hideActions }
      />
    );
  };

  const renderSubtitles = () => {
    if (!selectedSubtitle) {
      return null;
    }

    const { url } = selectedSubtitle;

    if (!url) {
      return null;
    }

    return (
      <PlayerSubtitles
        player={ player }
        subtitleUrl={ url }
      />
    );
  };

  const renderDuration = () => (
    <PlayerDuration />
  );

  const renderBottomActions = () => {
    const { subtitles = [] } = video;

    return (
      <View style={ styles.bottomActions }>
        <SpatialNavigationView
          direction="horizontal"
          style={ {
            ...styles.controlsRow,
            ...(hideActions ? styles.controlsRowHidden : {}),
          } }
        >
          { renderBottomAction('high-quality', 'Quality', openQualitySelector, bottomActionRef) }
          { renderBottomAction('playlist-play', 'Series', openVideoSelector) }
          { subtitles.length > 0 && renderBottomAction('subtitles', 'Subtitles', openSubtitleSelector) }
          { renderBottomAction('bookmarks', 'Bookmarks') }
          { renderBottomAction('share', 'Share') }
        </SpatialNavigationView>
        { renderDuration() }
      </View>
    );
  };

  const renderBackground = () => (
    <ThemedView.Animated style={ [styles.background, controlsAnimation] }>
      <LinearGradient
        style={ styles.backgroundGradient }
        colors={ ['rgba(0, 0, 0, 0.8)', 'transparent'] }
        start={ { x: 0, y: 1 } }
        end={ { x: 0, y: 0 } }
      />
    </ThemedView.Animated>
  );

  const renderControls = () => (
    <ThemedView.Animated style={ [styles.controls, controlsAnimation] }>
      { renderTopInfo() }
      { renderTopActions() }
      <DefaultFocus>
        { renderProgressBar() }
      </DefaultFocus>
      { renderBottomActions() }
    </ThemedView.Animated>
  );

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
        voice={ voice }
      />
    );
  };

  const renderSubtitlesSelector = () => {
    const { subtitles = [] } = video;

    return (
      <ThemedDropdown
        asOverlay
        overlayId={ SUBTITLE_OVERLAY_ID }
        header="Subtitles"
        value={ selectedSubtitle?.languageCode }
        data={ subtitles.map((subtitle) => ({
          label: subtitle.name,
          value: subtitle.languageCode,
        })) }
        onChange={ handleSubtitleChange }
      />
    );
  };

  const renderModals = () => (
    <>
      { renderQualitySelector() }
      { renderPlayerVideoSelector() }
      { renderSubtitlesSelector() }
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
      { renderSubtitles() }
      { renderBackground() }
      { renderControls() }
      { renderLoader() }
      { renderModals() }
    </View>
  );
}

export default observer(PlayerComponent);
