import { BookmarksOverlay } from 'Component/BookmarksOverlay';
import { CommentsOverlay } from 'Component/CommentsOverlay';
import { Loader } from 'Component/Loader';
import { PlayerCDNSelector } from 'Component/PlayerCDNSelector';
import { PlayerClock } from 'Component/PlayerClock';
import { PlayerDuration } from 'Component/PlayerDuration';
import { PlayerDurationEnd } from 'Component/PlayerDurationEnd';
import { PlayerProgressBar } from 'Component/PlayerProgressBar';
import { PlayerVideoSelector } from 'Component/PlayerVideoSelector';
import { ThemedDropdown } from 'Component/ThemedDropdown';
import { ThemedPressable } from 'Component/ThemedPressable';
import { ThemedText } from 'Component/ThemedText';
import { useConfigContext } from 'Context/ConfigContext';
import * as Haptics from 'expo-haptics';
import * as ScreenOrientation from 'expo-screen-orientation';
import { OrientationLock } from 'expo-screen-orientation';
import { useLatest } from 'Hooks/useLatest';
import { usePictureInPicture } from 'Hooks/usePictureInPicture';
import { usePlayerSlideGestures } from 'Hooks/usePlayerSlideGestures';
import { useRestartableTimeout } from 'Hooks/useRestartableTimeout';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import ArrowLeft from 'lucide-react-native/icons/arrow-left';
import Bookmark from 'lucide-react-native/icons/bookmark';
import BookmarkCheck from 'lucide-react-native/icons/bookmark-check';
import ClosedCaption from 'lucide-react-native/icons/closed-caption';
import FastForward from 'lucide-react-native/icons/fast-forward';
import Forward from 'lucide-react-native/icons/forward';
import Gauge from 'lucide-react-native/icons/gauge';
import ListVideo from 'lucide-react-native/icons/list-video';
import LockKeyhole from 'lucide-react-native/icons/lock-keyhole';
import LockKeyholeOpen from 'lucide-react-native/icons/lock-keyhole-open';
import Maximize2 from 'lucide-react-native/icons/maximize-2';
import MessageSquareText from 'lucide-react-native/icons/message-square-text';
import Pause from 'lucide-react-native/icons/pause';
import PictureInPicture2 from 'lucide-react-native/icons/picture-in-picture-2';
import Play from 'lucide-react-native/icons/play';
import Rewind from 'lucide-react-native/icons/rewind';
import Server from 'lucide-react-native/icons/server';
import Settings2 from 'lucide-react-native/icons/settings-2';
import SkipBack from 'lucide-react-native/icons/skip-back';
import SkipForward from 'lucide-react-native/icons/skip-forward';
import {
  ComponentType,
  Fragment,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { AppState, useWindowDimensions, View } from 'react-native';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { VideoView } from 'react-native-video';
import { scheduleOnRN } from 'react-native-worklets';
import { useAppTheme } from 'Theme/context';
import { ClosedCaptionFilled } from 'Theme/icons';
import { hideSystemBars, showSystemBars } from 'Util/Device';
import {
  formatVideoTrackInfo,
  getPlayerAvailableQualityItems,
  getScheduleEpisodeName,
} from 'Util/Player';

import {
  DEFAULT_SPEED,
  DEFAULT_SPEEDS,
  DOUBLE_TAP_ANIMATION,
  DOUBLE_TAP_ANIMATION_DELAY,
  PLAYER_CONTROLS_ANIMATION,
  PLAYER_CONTROLS_TIMEOUT,
  PlayerSlideControl,
  RewindDirection,
  SUBTITLES_OFF,
} from './Player.config';
import { componentStyles, MiddleActionVariant } from './Player.style';
import { DoubleTapAction, PlayerComponentProps } from './Player.type';
import { PlayerSlideIndicator } from './PlayerSlideIndicator';

// a real component rather than a render helper, so that handlers reach it as props
// instead of as call arguments (see react-hooks/refs)
const PlayerAction = ({
  IconComponent,
  action,
  onInteraction,
}: {
  IconComponent: ComponentType<any>;
  action?: () => void;
  onInteraction: (action?: () => void) => void;
}) => {
  const { scale, theme } = useAppTheme();
  const styles = useThemedStyles(componentStyles);

  return (
    <GestureDetector gesture={ Gesture.Tap() }>
      <ThemedPressable
        style={ styles.action }
        onPress={ () => onInteraction(action) }
      >
        <IconComponent
          size={ scale(28) }
          color={ theme.colors.iconOnContrast }
        />
      </ThemedPressable>
    </GestureDetector>
  );
};

export function PlayerComponent({
  player,
  status,
  isPlaying,
  video,
  film,
  voice,
  videoTrack,
  selectedSubtitle,
  qualityOverlayRef,
  subtitleOverlayRef,
  playerVideoSelectorOverlayRef,
  commentsOverlayRef,
  bookmarksOverlayRef,
  speedOverlayRef,
  cdnOverlayRef,
  selectedCDN,
  isAutomaticCDN,
  cdnOptions,
  selectedSpeed,
  selectedAspectRatio,
  isLocked,
  isOverlayOpen,
  isFilmBookmarked,
  isOffline,
  overlayQuality,
  isVideoLoading,
  hasPlaybackError,
  togglePlayPause,
  seekToPosition,
  calculateCurrentTime,
  handleNewEpisode,
  handleQualityChange,
  openQualitySelector,
  openVideoSelector,
  handleVideoSelect,
  rewindPosition,
  openSubtitleSelector,
  handleSubtitleChange,
  handleSpeedChange,
  openSpeedSelector,
  openCDNSelector,
  handleCDNChange,
  handleAutomaticCDNChange,
  handleAspectRatioChange,
  openBookmarksOverlay,
  openCommentsOverlay,
  handleLockControls,
  handleShare,
  closeOverlay,
  onBookmarkChange,
  setPlayerRate,
  handleBackButtonPress,
}: PlayerComponentProps) {
  const { playerLongPressSpeed } = useConfigContext();
  const { width: screenWidth } = useWindowDimensions();
  const { scale, theme } = useAppTheme();
  const styles = useThemedStyles(componentStyles);
  const {
    playerRewindSeconds,
    playerBackwardRewindSeconds,
    playerShowEpisodeName,
  } = useConfigContext();
  const [showControls, setShowControls] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [doubleTapAction, setDoubleTapAction] = useState<DoubleTapAction | null>(null);
  const [longTapAction, setLongTapAction] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const {
    ref: videoViewRef,
    isSupported: isPipSupported,
    enter: enterPictureInPicture,
  } = usePictureInPicture(status);
  const controlsTimeout = useRestartableTimeout();
  const doubleTapTimeout = useRestartableTimeout();
  const {
    slideGesture,
    volumeIndicator,
    brightnessIndicator,
    isVolumeGestureEnabled,
    isBrightnessGestureEnabled,
  } = usePlayerSlideGestures(!isLocked);

  // the auto hide timeout fires seconds after it was armed, so it has to read
  // these when it runs rather than from the render that scheduled it
  const getIsPlaying = useLatest(isPlaying);
  const getShowControls = useLatest(showControls);
  const getIsOverlayOpen = useLatest(isOverlayOpen);
  const getIsScrolling = useLatest(isScrolling);

  const controlsAnimation = useAnimatedStyle(() => ({
    opacity: withTiming(showControls ? 1 : 0, { duration: PLAYER_CONTROLS_ANIMATION }),
  }));

  const setControlsTimeout = useCallback(() => {
    controlsTimeout.start(() => {
      if (getIsPlaying()
        && getShowControls()
        && !getIsOverlayOpen()
        && !getIsScrolling()
      ) {
        setShowControls(false);
      }
    }, PLAYER_CONTROLS_TIMEOUT);
  }, [controlsTimeout, getIsPlaying, getShowControls, getIsOverlayOpen, getIsScrolling]);

  useEffect(() => {
    setControlsTimeout();
  }, [isPlaying, isOverlayOpen, player, setControlsTimeout]);

  useEffect(() => {
    ScreenOrientation.lockAsync(OrientationLock.LANDSCAPE);

    hideSystemBars('slide');

    const focusSubscription = AppState.addEventListener('focus', () => {
      hideSystemBars('none');
    });

    // the controls and double tap timeouts clear themselves on unmount
    return () => {
      ScreenOrientation.unlockAsync();
      showSystemBars('slide');
      focusSubscription.remove();
    };
  }, []);

  // the seek bar folds both of these into the deps of its pan gesture. Dragging flips
  // `isScrolling`, which re-renders this component, so a fresh identity here would rebuild
  // that gesture in the middle of the drag it was started by.
  const handleUserInteraction = useCallback((action?: () => void) => {
    setControlsTimeout();

    if (action) {
      action();
    }
  }, [setControlsTimeout]);

  const handleIsScrolling = useCallback((value: boolean) => {
    setIsScrolling(value);
  }, []);

  const handleOpenComments = () => {
    setShowControls(false);
    setIsCommentsOpen(true);

    setTimeout(() => {
      openCommentsOverlay();
    }, 250);
  };

  const handleDoubleTap = (direction: RewindDirection) => {
    const seconds = direction === RewindDirection.BACKWARD
      ? playerBackwardRewindSeconds
      : playerRewindSeconds;

    rewindPosition(direction, seconds);
    setDoubleTapAction({
      seconds: doubleTapAction?.direction === direction ? seconds + (doubleTapAction?.seconds ?? 0) : seconds,
      direction,
      isVisible: true,
    });

    doubleTapTimeout.start(() => {
      setDoubleTapAction((prev) => prev ? { ...prev, isVisible: false } : null);

      setTimeout(() => {
        setDoubleTapAction(null);
      }, DOUBLE_TAP_ANIMATION_DELAY);
    }, DOUBLE_TAP_ANIMATION);
  };

  const singleTap = Gesture.Tap()
    .maxDuration(250)
    .onEnd(() => {
      if (doubleTapAction) {
        return;
      }

      scheduleOnRN(setShowControls, !showControls);
      scheduleOnRN(handleUserInteraction);
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .maxDuration(300)
    .onEnd((e) => {
      if (isLocked) {
        return;
      }

      const { absoluteX } = e;

      if (absoluteX < (screenWidth / 2)) {
        scheduleOnRN(handleDoubleTap, RewindDirection.BACKWARD);
      } else {
        scheduleOnRN(handleDoubleTap, RewindDirection.FORWARD);
      }

      scheduleOnRN(setShowControls, false);
    });

  const longPressGesture = Gesture.LongPress()
    .maxDistance(Number.POSITIVE_INFINITY)
    .onStart(() => {
      if (showControls || isLocked || !isPlaying) {
        return;
      }

      scheduleOnRN(Haptics.performAndroidHapticsAsync, Haptics.AndroidHaptics.Gesture_Start);
      scheduleOnRN(setPlayerRate, playerLongPressSpeed);
      scheduleOnRN(setLongTapAction, true);
    })
    .onEnd(() => {
      scheduleOnRN(setPlayerRate, 1);
      scheduleOnRN(setLongTapAction, false);
    });

  const enablePIP = () => {
    setShowControls(false);
    // let the controls unmount first, they would otherwise be captured in the
    // picture in picture window
    setTimeout(enterPictureInPicture, 0);
  };

  const renderBackButton = () => (
    <View style={ styles.backButtonContainer }>
      <ThemedPressable
        style={ styles.backButton }
        contentStyle={ styles.backButtonContent }
        onPress={ handleBackButtonPress }
      >
        <ArrowLeft
          size={ scale(24) }
          color={ theme.colors.iconOnContrast }
        />
      </ThemedPressable>
    </View>
  );

  const renderEpisodeName = () => {
    if (!playerShowEpisodeName) {
      return null;
    }

    const episodeName = getScheduleEpisodeName(film, voice);

    if (!episodeName) {
      return null;
    }

    return (
      <ThemedText style={ styles.episodeName } numberOfLines={ 1 }>
        { episodeName }
      </ThemedText>
    );
  };

  const renderTitle = () => {
    const { title, hasSeasons } = film;

    return (
      <View style={ styles.titleWrapper }>
        <ThemedText style={ styles.title } numberOfLines={ 1 }>
          { title }
        </ThemedText>
        { hasSeasons && (
          <ThemedText style={ styles.title }>
            { t('Season {{season}} - Episode {{episode}}', {
              season: voice.lastSeasonId,
              episode: voice.lastEpisodeId,
            }) }
          </ThemedText>
        ) }
        { renderEpisodeName() }
      </View>
    );
  };

  const renderSubtitle = () => {
    const { releaseDate, countries, ratings } = film;

    return (
      <ThemedText style={ styles.subtitle }>
        {
          `${releaseDate} • ${ratings ? ratings[0].text : ''} • ${countries ? countries[0].name : ''}`
        }
      </ThemedText>
    );
  };

  const renderTopInfo = () => (
    <View style={ styles.topInfoWrapper }>
      { !isLocked && renderBackButton() }
      <View style={ styles.topInfo }>
        { renderTitle() }
        { renderSubtitle() }
      </View>
    </View>
  );

  const renderSubtitlesActions = () => {
    const { subtitles = [] } = video;

    if (!subtitles.length) {
      return null;
    }

    return (
      <PlayerAction
        IconComponent={ !selectedSubtitle?.languageCode
          ? ClosedCaption
          : ClosedCaptionFilled({ color: theme.colors.iconOnContrast }) }
        action={ openSubtitleSelector }
        onInteraction={ handleUserInteraction }
      />
    );
  };

  const renderTopActions = () => (
    <View style={ styles.topActions }>
      { renderTopInfo() }
      <View style={ styles.actionsRow }>
        <View
          style={ [
            styles.actionsRow,
            isLocked && styles.actionsRowDisabled,
          ] }
        >
          { isPipSupported && (
            <PlayerAction
              IconComponent={ PictureInPicture2 }
              action={ enablePIP }
              onInteraction={ handleUserInteraction }
            />
          ) }
          <PlayerAction
            IconComponent={ Gauge }
            action={ openSpeedSelector }
            onInteraction={ handleUserInteraction }
          />
          <PlayerAction
            IconComponent={ Settings2 }
            action={ openQualitySelector }
            onInteraction={ handleUserInteraction }
          />
          { renderSubtitlesActions() }
        </View>
        <PlayerAction
          IconComponent={ !isLocked ? LockKeyholeOpen : LockKeyhole }
          action={ handleLockControls }
          onInteraction={ handleUserInteraction }
        />
      </View>
    </View>
  );

  const renderMiddleControl = (
    IconComponent: ComponentType<any>,
    action: () => void,
    size: MiddleActionVariant = 'small'
  ) => (
    <GestureDetector gesture={ Gesture.Tap() }>
      <ThemedPressable
        style={ [styles.control, size === 'big' && styles.controlBig] }
        onPress={ () => handleUserInteraction(action) }
      >
        <IconComponent
          size={ scale(size === 'big' ? 28 : 20) }
          color={ theme.colors.iconOnContrast }
        />
      </ThemedPressable>
    </GestureDetector>
  );

  // the control is the only thing standing where the full screen loader spins,
  // so it takes the spinner over instead of showing a play icon for a video that
  // is not ready to play yet
  const getPlayPauseIcon = () => {
    if (isVideoLoading) {
      return Loader;
    }

    return isPlaying ? Pause : Play;
  };

  const renderMiddleControls = () => {
    if (isLocked) {
      return null;
    }

    return (
      <View style={ styles.middleActions }>
        { film.hasSeasons && renderMiddleControl(
          SkipBack,
          () => handleNewEpisode(RewindDirection.BACKWARD)
        ) }
        { renderMiddleControl(
          getPlayPauseIcon(),
          togglePlayPause,
          'big'
        ) }
        { film.hasSeasons && renderMiddleControl(
          SkipForward,
          () => handleNewEpisode(RewindDirection.FORWARD)
        ) }
      </View>
    );
  };

  const renderTopActionLine = () => (
    <View style={ styles.actionLine }>
      <PlayerDurationEnd />
      <PlayerDuration />
    </View>
  );

  const renderProgressBar = () => {
    const { storyboardUrl } = video;

    return (
      <PlayerProgressBar
        player={ player }
        storyboardUrl={ storyboardUrl }
        seekToPosition={ seekToPosition }
        calculateCurrentTime={ calculateCurrentTime }
        handleIsScrolling={ handleIsScrolling }
        handleUserInteraction={ handleUserInteraction }
      />
    );
  };

  const renderBottomActionLine = () => {
    return (
      <View style={ styles.actionLine }>
        <PlayerClock />
        <ThemedText style={ styles.actionLineText }>
          { formatVideoTrackInfo(videoTrack) }
        </ThemedText>
      </View>
    );
  };

  const renderBottomActions = () => {
    const { hasSeasons, hasVoices } = film;

    const isPlaylistSelector = hasSeasons || hasVoices;

    return (
      <View style={ styles.bottomActions }>
        <View style={ styles.durationRow }>
          { renderTopActionLine() }
        </View>
        <View style={ [styles.progressBarRow, isLocked && styles.progressBarRowLocked] }>
          { renderProgressBar() }
        </View>
        <View style={ styles.bottomActionsRowLine }>
          { renderBottomActionLine() }
          <View
            style={ [
              styles.actionsRow,
              styles.bottomActionsRow,
              isLocked && styles.bottomActionsRowLocked,
            ] }
          >
            { !isOffline && (
              <PlayerAction
                IconComponent={ Server }
                action={ openCDNSelector }
                onInteraction={ handleUserInteraction }
              />
            ) }
            { isPlaylistSelector && (
              <PlayerAction
                IconComponent={ ListVideo }
                action={ openVideoSelector }
                onInteraction={ handleUserInteraction }
              />
            ) }
            { !isOffline && (
              <PlayerAction
                IconComponent={ MessageSquareText }
                action={ handleOpenComments }
                onInteraction={ handleUserInteraction }
              />
            ) }
            { !isOffline && (
              <PlayerAction
                IconComponent={ isFilmBookmarked ? BookmarkCheck : Bookmark }
                action={ openBookmarksOverlay }
                onInteraction={ handleUserInteraction }
              />
            ) }
            { !isOffline && (
              <PlayerAction
                IconComponent={ Forward }
                action={ handleShare }
                onInteraction={ handleUserInteraction }
              />
            ) }
            <PlayerAction
              IconComponent={ Maximize2 }
              action={ handleAspectRatioChange }
              onInteraction={ handleUserInteraction }
            />
          </View>
        </View>
      </View>
    );
  };

  const renderDoubleTapAction = () => {
    const { seconds = 10, direction, isVisible } = doubleTapAction ?? {};

    return (
      <Fragment>
        <Animated.View
          style={ [
            styles.doubleTapAction,
            styles.doubleTapActionLeft,
            (direction === RewindDirection.BACKWARD && isVisible) && styles.doubleTapActionVisible,
          ] }
        >
          <View style={ styles.doubleTapContainer }>
            <View style={ styles.doubleTapIcon }>
              <Rewind color={ theme.colors.iconOnContrast } />
            </View>
            <ThemedText style={ styles.longTapText }>
              { t('{{seconds}} seconds', { seconds: `-${seconds}` }) }
            </ThemedText>
          </View>
        </Animated.View>
        <Animated.View
          style={ [
            styles.doubleTapAction,
            styles.doubleTapActionRight,
            (direction === RewindDirection.FORWARD && isVisible) && styles.doubleTapActionVisible,
          ] }
        >
          <View style={ styles.doubleTapContainer }>
            <View style={ styles.doubleTapIcon }>
              <FastForward color={ theme.colors.iconOnContrast } />
            </View>
            <ThemedText style={ styles.longTapText }>
              { t('{{seconds}} seconds', { seconds: `${seconds}` }) }
            </ThemedText>
          </View>
        </Animated.View>
      </Fragment>
    );
  };

  const renderLongTapAction = () => {
    return (
      <View style={ styles.longTapAction }>
        <View
          style={ [
            styles.longTapContainer,
            longTapAction && styles.longTapActionVisible,
          ] }
        >
          <ThemedText style={ styles.longTapText }>
            { `${playerLongPressSpeed}x` }
          </ThemedText>
          <FastForward
            size={ scale(18) }
            color={ theme.colors.iconOnContrast }
          />
        </View>
      </View>
    );
  };

  // each level shows up on the half the finger is not on - the hand adjusting it would
  // otherwise sit right on top of it
  const renderSlideIndicators = () => (
    <Fragment>
      { isVolumeGestureEnabled && (
        <PlayerSlideIndicator
          control={ PlayerSlideControl.VOLUME }
          indicator={ volumeIndicator }
        />
      ) }
      { isBrightnessGestureEnabled && (
        <PlayerSlideIndicator
          control={ PlayerSlideControl.BRIGHTNESS }
          indicator={ brightnessIndicator }
        />
      ) }
    </Fragment>
  );

  const renderControls = () => (
    <GestureDetector
      gesture={ Gesture.Race(
        doubleTap,
        singleTap,
        longPressGesture,
        slideGesture
      ) }
    >
      <View style={ styles.controlsContainer }>
        <Animated.View style={ [
          styles.controls,
          controlsAnimation,
          !showControls && styles.controlsDisabled,
        ] }
        >
          { renderTopActions() }
          { renderMiddleControls() }
          { renderBottomActions() }
        </Animated.View>
        { renderDoubleTapAction() }
        { renderLongTapAction() }
        { renderSlideIndicators() }
      </View>
    </GestureDetector>
  );

  // only when the play/pause control is not there to hold the spinner itself:
  // both sit dead centre, so showing the two of them just stacks them
  const renderLoader = () => (
    <Loader
      isLoading={ isVideoLoading && (!showControls || isLocked) }
      fullScreen
    />
  );

  const renderError = () => {
    if (!hasPlaybackError) {
      return null;
    }

    return (
      <View style={ styles.error }>
        <ThemedText style={ styles.errorText }>
          { t('Failed to load the video') }
        </ThemedText>
        <ThemedText style={ styles.errorHint }>
          { t('Check your connection or try another quality') }
        </ThemedText>
      </View>
    );
  };

  const renderQualitySelector = () => {
    return (
      <ThemedDropdown
        asOverlay
        overlayRef={ qualityOverlayRef }
        header={ t('Quality') }
        value={ overlayQuality }
        data={ getPlayerAvailableQualityItems(video) }
        onChange={ handleQualityChange }
        onClose={ closeOverlay }
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
        ref={ playerVideoSelectorOverlayRef }
        film={ film }
        onSelect={ handleVideoSelect }
        voice={ voice }
        onClose={ closeOverlay }
        isOffline={ isOffline }
      />
    );
  };

  const renderSubtitlesSelector = () => {
    const { subtitles = [] } = video;

    return (
      <ThemedDropdown
        asOverlay
        overlayRef={ subtitleOverlayRef }
        header={ t('Subtitles') }
        value={ selectedSubtitle?.languageCode ?? SUBTITLES_OFF.value }
        data={ [
          SUBTITLES_OFF,
          ...subtitles.map((subtitle) => ({
            label: subtitle.name,
            value: subtitle.languageCode,
          })),
        ] }
        onChange={ handleSubtitleChange }
        onClose={ closeOverlay }
      />
    );
  };

  const renderCommentsOverlay = () => (
    <CommentsOverlay
      overlayRef={ commentsOverlayRef }
      film={ film }
      style={ styles.commentsOverlayModal }
      containerStyle={ styles.commentsOverlay }
      contentContainerStyle={ styles.commentsOverlayContent }
      contentStyle={ styles.commentsOverlayList }
      onClose={ () => {
        closeOverlay();
        setIsCommentsOpen(false);
      } }
    />
  );

  const renderBookmarksOverlay = () => (
    <BookmarksOverlay
      overlayRef={ bookmarksOverlayRef }
      film={ film }
      onClose={ closeOverlay }
      onBookmarkChange={ onBookmarkChange }
    />
  );

  const renderSpeedSelector = () => (
    <ThemedDropdown
      asOverlay
      overlayRef={ speedOverlayRef }
      header={ t('Speed') }
      value={ String(selectedSpeed) }
      data={ DEFAULT_SPEEDS.map((speed) => ({
        label: speed === DEFAULT_SPEED ? t('Normal') : `${speed}x`,
        value: String(speed),
      })) }
      onChange={ handleSpeedChange }
      onClose={ closeOverlay }
    />
  );

  const renderCDNSelector = () => {
    if (isOffline) {
      return null;
    }

    return (
      <PlayerCDNSelector
        overlayRef={ cdnOverlayRef }
        cdn={ selectedCDN }
        cdnOptions={ cdnOptions }
        isAutomatic={ isAutomaticCDN }
        onAutomaticChange={ handleAutomaticCDNChange }
        onChange={ handleCDNChange }
        onClose={ closeOverlay }
      />
    );
  };

  const renderModals = () => (
    <>
      { renderQualitySelector() }
      { renderPlayerVideoSelector() }
      { renderSubtitlesSelector() }
      { renderCommentsOverlay() }
      { renderBookmarksOverlay() }
      { renderSpeedSelector() }
      { renderCDNSelector() }
    </>
  );

  return (
    <View
      style={ [
        styles.container,
        isCommentsOpen && { width: screenWidth * 0.45 },
      ] }
    >
      <VideoView
        ref={ videoViewRef }
        style={ styles.video }
        player={ player }
        resizeMode={ selectedAspectRatio }
        controls={ false }
        pictureInPicture={ isPipSupported }
      />
      { renderError() }
      { renderControls() }
      { renderLoader() }
      { renderModals() }
    </View>
  );
}

export default PlayerComponent;
