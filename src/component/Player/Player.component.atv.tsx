import BookmarksSelector from 'Component/BookmarksSelector';
import Comments from 'Component/Comments';
import Loader from 'Component/Loader';
import PlayerClock from 'Component/PlayerClock';
import PlayerDuration from 'Component/PlayerDuration';
import PlayerProgressBar from 'Component/PlayerProgressBar';
import PlayerSubtitles from 'Component/PlayerSubtitles';
import PlayerVideoSelector from 'Component/PlayerVideoSelector';
import ThemedDropdown from 'Component/ThemedDropdown';
import ThemedOverlay from 'Component/ThemedOverlay';
import ThemedText from 'Component/ThemedText';
import { useOverlayContext } from 'Context/OverlayContext';
import { usePlayerContext } from 'Context/PlayerContext';
import { LinearGradient } from 'expo-linear-gradient';
import { VideoView } from 'expo-video';
import t from 'i18n/t';
import {
  Bookmark,
  Captions,
  CaptionsOff,
  FastForward,
  Gauge,
  ListVideo,
  MessageSquareText,
  Pause,
  Play,
  Rewind,
  SkipBack,
  SkipForward,
  Sparkles,
} from 'lucide-react-native';
import React, {
  Ref,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  BackHandler,
  View,
} from 'react-native';
import Animated, { runOnJS, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import {
  DefaultFocus,
  SpatialNavigationFocusableView,
  SpatialNavigationNodeRef,
  SpatialNavigationView,
} from 'react-tv-space-navigation';
import { Colors } from 'Style/Colors';
import { scale } from 'Util/CreateStyles';
import { setTimeoutSafe } from 'Util/Misc';
import RemoteControlManager from 'Util/RemoteControl/RemoteControlManager';
import { SupportedKeys } from 'Util/RemoteControl/SupportedKeys';

import {
  DEFAULT_SPEED,
  DEFAULT_SPEEDS,
  FocusedElement,
  PLAYER_CONTROLS_ANIMATION,
  PLAYER_CONTROLS_TIMEOUT,
  RewindDirection,
} from './Player.config';
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
  qualityOverlayId,
  subtitleOverlayId,
  playerVideoSelectorOverlayId,
  commentsOverlayId,
  bookmarksOverlayId,
  speedOverlayId,
  selectedSpeed,
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
  handleSpeedChange,
  openSpeedSelector,
  openBookmarksOverlay,
  openCommentsOverlay,
}: PlayerComponentProps) {
  const { focusedElement, updateFocusedElement } = usePlayerContext();
  const { currentOverlay, goToPreviousOverlay } = useOverlayContext();
  const [showControls, setShowControls] = useState(false);
  const [hideActions, setHideActions] = useState(false);
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);
  const topActionRef = useRef<SpatialNavigationNodeRef | null>(null);
  const middleActionRef = useRef<SpatialNavigationNodeRef | null>(null);
  const bottomActionRef = useRef<SpatialNavigationNodeRef | null>(null);
  const showControlsRef = useRef(showControls);
  const currentOverlayRef = useRef(currentOverlay);
  const isComponentMounted = useRef(true);
  const focusedElementRef = useRef(focusedElement);
  const hideActionsRef = useRef(hideActions);

  const controlsAnimation = useAnimatedStyle(() => ({
    opacity: withTiming(
      showControls ? 1 : 0,
      { duration: PLAYER_CONTROLS_ANIMATION },
      (finished) => {
        if (!showControls && hideActions && finished) {
          runOnJS(setHideActions)(false);
        }
      }
    ),
  }));

  const closeControls = () => {
    setShowControls(false);
    updateFocusedElement(FocusedElement.PROGRESS_THUMB);
    middleActionRef.current?.focus();
  };

  useEffect(() => {
    currentOverlayRef.current = currentOverlay;
    showControlsRef.current = showControls;
    focusedElementRef.current = focusedElement;
    hideActionsRef.current = hideActions;
  }, [showControls, currentOverlay, focusedElement, hideActions]);

  useEffect(() => {
    return () => {
      isComponentMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const keyDownListener = (type: SupportedKeys) => {
      if (!isComponentMounted.current || !player || currentOverlayRef.current.length) return false;

      if (type === SupportedKeys.BACKWARD) {
        seekToPosition(0);
        togglePlayPause(false);

        return true;
      }

      if (!showControlsRef.current) {
        if (type === SupportedKeys.BACK) {
          return true;
        }

        if (type === SupportedKeys.UP) {
          updateFocusedElement(FocusedElement.TOP_ACTION);
          topActionRef.current?.focus();
        }

        if (type === SupportedKeys.ENTER
          || type === SupportedKeys.LEFT
          || type === SupportedKeys.RIGHT
        ) {
          updateFocusedElement(FocusedElement.PROGRESS_THUMB);
          middleActionRef.current?.focus();

          if (type === SupportedKeys.LEFT || type === SupportedKeys.RIGHT) {
            setHideActions(true);
            setShowControls(true);

            return false;
          }
        }

        if (type === SupportedKeys.DOWN) {
          updateFocusedElement(FocusedElement.BOTTOM_ACTION);
          bottomActionRef.current?.focus();
        }

        setShowControls(true);

        return false;
      }

      if (focusedElementRef.current === FocusedElement.PROGRESS_THUMB) {
        if (type === SupportedKeys.ENTER) {
          togglePlayPause();
        }

        if ((type === SupportedKeys.UP || type === SupportedKeys.DOWN) && hideActionsRef.current) {
          setHideActions(false);
        }

        if (type === SupportedKeys.LEFT || type === SupportedKeys.RIGHT) {
          setHideActions(true);
          setShowControls(true);
        }
      }

      return false;
    };

    const keyUpListener = (_type: SupportedKeys) => {
      if (!isComponentMounted.current || !player) return false;

      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }

      controlsTimeout.current = setTimeoutSafe(() => {
        if (!isComponentMounted.current || !player) return;

        if (player.playing
          && showControlsRef.current
          && !currentOverlayRef.current.length
        ) {
          closeControls();
        }
      }, PLAYER_CONTROLS_TIMEOUT);

      return false;
    };

    const backAction = () => {
      if (showControlsRef.current) {
        setShowControls(false);

        return true;
      }

      return false;
    };

    const remoteControlDownListener = RemoteControlManager.addKeydownListener(keyDownListener);
    const remoteControlUpListener = RemoteControlManager.addKeyupListener(keyUpListener);

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => {
      RemoteControlManager.removeKeydownListener(remoteControlDownListener);
      RemoteControlManager.removeKeyupListener(remoteControlUpListener);
      backHandler.remove();

      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
        controlsTimeout.current = null;
      }
    };
  }, [player]);

  const handleOpenComments = () => {
    openCommentsOverlay();

    setTimeout(() => {
      closeControls();
    }, 0);
  };

  const renderTitle = () => {
    const { title, hasSeasons } = film;

    return (
      <ThemedText style={ styles.title }>
        {
          `${title}${hasSeasons ? ` ${t('Season %s - Episode %s', voice.lastSeasonId, voice.lastEpisodeId)}` : ''}`
        }
      </ThemedText>
    );
  };

  const renderSubtitle = () => {
    const { releaseDate, countries = [], ratings = [] } = film;

    return (
      <ThemedText style={ styles.subtitle }>
        {
          `${releaseDate} • ${ratings.length ? ratings[0].text : ''} • ${countries.length ? countries[0].name : ''}`
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
    IconComponent: React.ComponentType<any>,
    el: FocusedElement,
    action?: () => void,
    ref?: Ref<SpatialNavigationNodeRef>
  ) => (
    <SpatialNavigationFocusableView
      ref={ ref }
      onSelect={ action }
      onFocus={ () => updateFocusedElement(el) }
    >
      { ({ isFocused }) => (
        <View
          style={ [
            styles.action,
            isFocused && styles.focusedAction,
          ] }
        >
          <IconComponent
            size={ scale(28) }
            color={ Colors.white }
          />
        </View>
      ) }
    </SpatialNavigationFocusableView>
  );

  const renderTopAction = (
    icon: React.ComponentType<any>,
    action?: () => void,
    ref?: Ref<SpatialNavigationNodeRef>
  ) => renderAction(
    icon,
    FocusedElement.TOP_ACTION,
    action,
    ref
  );

  const renderTopActionLine = () => {
    return (
      <View style={ styles.topActionLine }>
        <ThemedText style={ styles.topActionLineText }>
          { selectedQuality }
        </ThemedText>
        <PlayerClock />
      </View>
    );
  };

  const renderBottomAction = (
    icon: React.ComponentType<any>,
    action?: () => void,
    ref?: Ref<SpatialNavigationNodeRef>
  ) => renderAction(
    icon,
    FocusedElement.BOTTOM_ACTION,
    action,
    ref
  );

  const renderTopActions = () => (
    <SpatialNavigationView
      direction="horizontal"
      style={ {
        ...styles.controlsRowLine,
        ...(hideActions ? styles.controlsRowHidden : {}),
      } }
    >
      <View style={ styles.controlsRow }>
        { renderTopAction(isPlaying || isLoading ? Pause : Play, togglePlayPause, topActionRef) }
        { renderTopAction(Rewind, () => rewindPosition(RewindDirection.BACKWARD)) }
        { renderTopAction(FastForward, () => rewindPosition(RewindDirection.FORWARD)) }
        { film.hasSeasons && (
          <>
            { renderTopAction(SkipBack, () => handleNewEpisode(RewindDirection.BACKWARD)) }
            { renderTopAction(SkipForward, () => handleNewEpisode(RewindDirection.FORWARD)) }
          </>
        ) }
        { renderTopAction(Gauge, openSpeedSelector) }
        { renderTopAction(MessageSquareText, handleOpenComments) }
      </View>
      { renderTopActionLine() }
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
          updateFocusedElement(FocusedElement.PROGRESS_THUMB);
        } }
        rewindPosition={ rewindPosition }
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
    const { hasSeasons, hasVoices } = film;
    const { subtitles = [] } = video;

    const isPlaylistSelector = hasSeasons || hasVoices;

    return (
      <View style={ styles.bottomActions }>
        <SpatialNavigationView
          direction="horizontal"
          style={ {
            ...styles.controlsRow,
            ...(hideActions ? styles.controlsRowHidden : {}),
          } }
        >
          { renderBottomAction(Sparkles, openQualitySelector, bottomActionRef) }
          { isPlaylistSelector && renderBottomAction(ListVideo, openVideoSelector) }
          { subtitles.length > 0 && renderBottomAction(
            selectedSubtitle?.languageCode === '' ? Captions : CaptionsOff,
            openSubtitleSelector
          ) }
          { renderBottomAction(Bookmark, openBookmarksOverlay) }
        </SpatialNavigationView>
        { renderDuration() }
      </View>
    );
  };

  const renderBackground = () => (
    <Animated.View style={ [styles.background, controlsAnimation] }>
      <LinearGradient
        style={ styles.backgroundGradient }
        colors={ ['rgba(0, 0, 0, 0.8)', 'transparent'] }
        start={ { x: 0, y: 1 } }
        end={ { x: 0, y: 0 } }
      />
    </Animated.View>
  );

  const renderControls = () => (
    <Animated.View style={ [styles.controls, controlsAnimation] }>
      { renderTopInfo() }
      { renderTopActions() }
      <DefaultFocus>
        { renderProgressBar() }
      </DefaultFocus>
      { renderBottomActions() }
    </Animated.View>
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
        overlayId={ qualityOverlayId }
        header={ t('Quality') }
        value={ selectedQuality }
        data={ streams.map((stream) => ({
          label: stream.quality,
          value: stream.quality,
        })).reverse() }
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
        overlayId={ playerVideoSelectorOverlayId }
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
        overlayId={ subtitleOverlayId }
        header={ t('Subtitles') }
        value={ selectedSubtitle?.languageCode }
        data={ subtitles.map((subtitle) => ({
          label: subtitle.name,
          value: subtitle.languageCode,
        })) }
        onChange={ handleSubtitleChange }
      />
    );
  };

  const renderCommentsOverlay = () => (
    <ThemedOverlay
      id={ commentsOverlayId }
      onHide={ () => goToPreviousOverlay() }
      containerStyle={ styles.commentsOverlay }
    >
      <Comments
        style={ styles.commentsOverlayContent }
        film={ film }
      />
    </ThemedOverlay>
  );

  const renderBookmarksOverlay = () => (
    <BookmarksSelector
      overlayId={ bookmarksOverlayId }
      film={ film }
    />
  );

  const renderSpeedSelector = () => (
    <ThemedDropdown
      asOverlay
      overlayId={ speedOverlayId }
      header={ t('Speed') }
      value={ String(selectedSpeed) }
      data={ DEFAULT_SPEEDS.map((speed) => ({
        label: speed === DEFAULT_SPEED ? t('Normal') : `${speed}x`,
        value: String(speed),
      })) }
      onChange={ handleSpeedChange }
    />
  );

  const renderModals = () => (
    <>
      { renderQualitySelector() }
      { renderPlayerVideoSelector() }
      { renderSubtitlesSelector() }
      { renderCommentsOverlay() }
      { renderBookmarksOverlay() }
      { renderSpeedSelector() }
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

export default PlayerComponent;
