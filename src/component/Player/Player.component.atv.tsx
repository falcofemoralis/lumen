import { setFocus } from '@noriginmedia/norigin-spatial-navigation-core';
import { FocusContext, useFocusable } from '@noriginmedia/norigin-spatial-navigation-react-native-tvos';
import { BookmarksOverlay } from 'Component/BookmarksOverlay';
import { CommentsOverlay } from 'Component/CommentsOverlay';
import { Loader } from 'Component/Loader';
import { PlayerClock } from 'Component/PlayerClock';
import { PlayerDuration } from 'Component/PlayerDuration';
import { PlayerDurationEnd } from 'Component/PlayerDurationEnd';
import { PlayerProgressBar } from 'Component/PlayerProgressBar';
import { PlayerVideoSelector } from 'Component/PlayerVideoSelector';
import { ThemedDropdown } from 'Component/ThemedDropdown';
import { ThemedPressable } from 'Component/ThemedPressable';
import { ThemedText } from 'Component/ThemedText';
import { useConfigContext } from 'Context/ConfigContext';
import { usePlayerContext } from 'Context/PlayerContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useLatest } from 'Hooks/useLatest';
import { useRestartableTimeout } from 'Hooks/useRestartableTimeout';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import Bookmark from 'lucide-react-native/icons/bookmark';
import BookmarkCheck from 'lucide-react-native/icons/bookmark-check';
import ClosedCaption from 'lucide-react-native/icons/closed-caption';
import Gauge from 'lucide-react-native/icons/gauge';
import ListVideo from 'lucide-react-native/icons/list-video';
import Maximize2 from 'lucide-react-native/icons/maximize-2';
import MessageSquareText from 'lucide-react-native/icons/message-square-text';
import Pause from 'lucide-react-native/icons/pause';
import Play from 'lucide-react-native/icons/play';
import Settings2 from 'lucide-react-native/icons/settings-2';
import SkipBack from 'lucide-react-native/icons/skip-back';
import SkipForward from 'lucide-react-native/icons/skip-forward';
import Undo2 from 'lucide-react-native/icons/undo-2';
import {
  ComponentType,
  useCallback,
  useEffect,
  useEffectEvent,
  useState,
} from 'react';
import {
  BackHandler,
  View,
} from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { VideoView } from 'react-native-video';
import { scheduleOnRN } from 'react-native-worklets';
import { useAppTheme } from 'Theme/context';
import { ClosedCaptionFilled } from 'Theme/icons';
import { formatVideoTrackInfo, getPlayerAvailableQualityItems } from 'Util/Player';
import RemoteControlManager from 'Util/RemoteControl/RemoteControlManager';
import { SupportedKeys } from 'Util/RemoteControl/SupportedKeys';

import {
  DEFAULT_SPEED,
  DEFAULT_SPEEDS,
  FocusedElement,
  PLAYER_CONTROLS_ANIMATION,
  PLAYER_CONTROLS_TIMEOUT,
  RewindDirection,
  SUBTITLES_OFF,
} from './Player.config';
import { componentStyles } from './Player.style.atv';
import { PlayerComponentProps } from './Player.type';

const TOP_ACTION_FOCUS_KEY = 'player-top-action';
const PROGRESS_THUMB_FOCUS_KEY = 'player-progress-thumb';
const BOTTOM_ACTION_FOCUS_KEY = 'player-bottom-action';

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
  selectedSpeed,
  isOverlayOpen,
  isFilmBookmarked,
  isOffline,
  overlayQuality,
  selectedAspectRatio,
  isLoading,
  hasPlaybackError,
  togglePlayPause,
  rewindPosition,
  openQualitySelector,
  handleQualityChange,
  handleNewEpisode,
  openVideoSelector,
  handleVideoSelect,
  openSubtitleSelector,
  handleSubtitleChange,
  calculateCurrentTime,
  seekToPosition,
  handleSpeedChange,
  openSpeedSelector,
  openBookmarksOverlay,
  openCommentsOverlay,
  closeOverlay,
  onBookmarkChange,
  backwardToStart,
  handleAspectRatioChange,
}: PlayerComponentProps) {
  const { playerStopPlayOnButtonTV, playerStopPlayShowInterfaceTV } = useConfigContext();
  const { scale, theme } = useAppTheme();
  const styles = useThemedStyles(componentStyles);
  const { focusedElement, updateFocusedElement } = usePlayerContext();
  const [showControls, setShowControls] = useState(false);
  const [hideActions, setHideActions] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const controlsTimeout = useRestartableTimeout();
  const { ref: topRowRef, focusKey: topRowFocusKey } = useFocusable();
  const { ref: bottomRowRef, focusKey: bottomRowFocusKey } = useFocusable();

  // the remote listeners below are registered once per player and the auto hide
  // timeout fires seconds after it was armed, so both have to read the current
  // values at call time instead of closing over the render that created them
  const getIsPlaying = useLatest(isPlaying);
  const getShowControls = useLatest(showControls);
  const getIsOverlayOpen = useLatest(isOverlayOpen);
  const getFocusedElement = useLatest(focusedElement);
  const getHideActions = useLatest(hideActions);
  const onTogglePlayPause = useEffectEvent(() => togglePlayPause());
  const onBackwardToStart = useEffectEvent(() => backwardToStart());

  const controlsAnimation = useAnimatedStyle(() => ({
    opacity: withTiming(
      showControls ? 1 : 0,
      { duration: PLAYER_CONTROLS_ANIMATION },
      (finished) => {
        if (!showControls && hideActions && finished) {
          scheduleOnRN(setHideActions, false);
        }
      }
    ),
  }));

  const closeControls = useCallback(() => {
    setShowControls(false);
    updateFocusedElement(FocusedElement.PROGRESS_THUMB);
    setFocus(PROGRESS_THUMB_FOCUS_KEY);
  }, [updateFocusedElement]);

  const setControlsTimeout = useCallback(() => {
    controlsTimeout.start(() => {
      if (getIsPlaying()
          && getShowControls()
          && !getIsOverlayOpen()
      ) {
        closeControls();
      }
    }, PLAYER_CONTROLS_TIMEOUT);
  }, [controlsTimeout, getIsPlaying, getShowControls, getIsOverlayOpen, closeControls]);

  useEffect(() => {
    setControlsTimeout();
  }, [isPlaying, isOverlayOpen, player, setControlsTimeout]);

  useEffect(() => {
    const keyDownListener = (type: SupportedKeys) => {
      if (getIsOverlayOpen()) return false;

      if (type === SupportedKeys.BACKWARD) {
        onBackwardToStart();

        return true;
      }

      if (!getShowControls()) {
        if (type === SupportedKeys.BACK) {
          return true;
        }

        if (type === SupportedKeys.UP) {
          updateFocusedElement(FocusedElement.TOP_ACTION);
          setFocus(TOP_ACTION_FOCUS_KEY);
        }

        if (type === SupportedKeys.ENTER
          || type === SupportedKeys.LEFT
          || type === SupportedKeys.RIGHT
        ) {
          updateFocusedElement(FocusedElement.PROGRESS_THUMB);
          setFocus(PROGRESS_THUMB_FOCUS_KEY);

          if (type === SupportedKeys.LEFT || type === SupportedKeys.RIGHT) {
            setHideActions(true);
            setShowControls(true);

            return false;
          }
        }

        if (type === SupportedKeys.DOWN) {
          updateFocusedElement(FocusedElement.BOTTOM_ACTION);
          setFocus(BOTTOM_ACTION_FOCUS_KEY);
        }

        if (playerStopPlayOnButtonTV && type === SupportedKeys.ENTER) {
          onTogglePlayPause();

          if (playerStopPlayShowInterfaceTV) {
            setShowControls(true);
          }

          return false;
        }

        setShowControls(true);

        return false;
      }

      if (getFocusedElement() === FocusedElement.PROGRESS_THUMB) {
        if (type === SupportedKeys.ENTER) {
          onTogglePlayPause();
        }

        if (type === SupportedKeys.UP || type === SupportedKeys.DOWN) {
          // Reveal the action rows if they were hidden while seeking, then move
          // focus onto the row explicitly. We can't rely on norigin's geometry
          // navigation here: the row was just un-hidden (opacity/reflow) and
          // navigating from the stale layout drops focus. Consume the event so
          // the layout adapter doesn't also run a conflicting geometry pass.
          if (getHideActions()) {
            setHideActions(false);
          }

          const isUp = type === SupportedKeys.UP;

          updateFocusedElement(isUp ? FocusedElement.TOP_ACTION : FocusedElement.BOTTOM_ACTION);
          setFocus(isUp ? TOP_ACTION_FOCUS_KEY : BOTTOM_ACTION_FOCUS_KEY);

          return true;
        }

        if (type === SupportedKeys.LEFT || type === SupportedKeys.RIGHT) {
          setHideActions(true);
          setShowControls(true);
        }
      }

      // Vertical navigation for the action rows is handled explicitly. The
      // inward hop lands on the thumb (a small element positioned at the current
      // progress %, so it rarely overlaps the focused action vertically and
      // norigin's geometry navigation skips it). The outward key is swallowed:
      // there is nothing focusable above the top row / below the bottom row, so
      // letting norigin run would navigate focus out and drop it. Either way we
      // consume both vertical keys; LEFT/RIGHT stay geometry-driven so in-row
      // navigation keeps working.
      // eslint-disable-next-line max-len
      if (getFocusedElement() === FocusedElement.TOP_ACTION && (type === SupportedKeys.UP || type === SupportedKeys.DOWN)) {
        if (type === SupportedKeys.DOWN) {
          updateFocusedElement(FocusedElement.PROGRESS_THUMB);
          setFocus(PROGRESS_THUMB_FOCUS_KEY);
        }

        return true;
      }

      // eslint-disable-next-line max-len
      if (getFocusedElement() === FocusedElement.BOTTOM_ACTION && (type === SupportedKeys.UP || type === SupportedKeys.DOWN)) {
        if (type === SupportedKeys.UP) {
          updateFocusedElement(FocusedElement.PROGRESS_THUMB);
          setFocus(PROGRESS_THUMB_FOCUS_KEY);
        }

        return true;
      }

      return false;
    };

    const keyUpListener = (_type: SupportedKeys) => {
      setControlsTimeout();

      return false;
    };

    const backAction = () => {
      if (getShowControls()) {
        updateFocusedElement(FocusedElement.PROGRESS_THUMB);
        setFocus(PROGRESS_THUMB_FOCUS_KEY);
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
    };
    // everything the listeners read goes through a stable getter on purpose -
    // re-subscribing the remote on each render drops key events mid-press
  }, [
    player,
    setControlsTimeout,
    getShowControls,
    getIsOverlayOpen,
    getFocusedElement,
    getHideActions,
    updateFocusedElement,
    playerStopPlayOnButtonTV,
    playerStopPlayShowInterfaceTV,
  ]);

  const handleOpenComments = () => {
    closeControls();
    setIsCommentsOpen(true);

    setTimeout(() => {
      openCommentsOverlay();
    }, 250);
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
      </View>
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
    IconComponent: ComponentType<any>,
    el: FocusedElement,
    action?: () => void,
    focusKey?: string
  ) => (
    <ThemedPressable
      focusKey={ focusKey }
      onPress={ action }
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
            size={ scale(26) }
            color={ theme.colors.iconOnContrast }
          />
        </View>
      ) }
    </ThemedPressable>
  );

  const renderTopAction = (
    icon: ComponentType<any>,
    action?: () => void,
    focusKey?: string
  ) => renderAction(
    icon,
    FocusedElement.TOP_ACTION,
    action,
    focusKey
  );

  const renderTopActionLine = () => {
    return (
      <View style={ styles.topActionLine }>
        <ThemedText style={ styles.topActionLineText }>
          { formatVideoTrackInfo(videoTrack) }
        </ThemedText>
        <PlayerClock />
        <PlayerDurationEnd />
      </View>
    );
  };

  const renderBottomAction = (
    icon: ComponentType<any>,
    action?: () => void,
    focusKey?: string
  ) => renderAction(
    icon,
    FocusedElement.BOTTOM_ACTION,
    action,
    focusKey
  );

  const renderTopActions = () => (
    <View
      style={ {
        ...styles.controlsRowLine,
        ...(hideActions ? styles.controlsRowHidden : {}),
      } }
    >
      <FocusContext.Provider value={ topRowFocusKey }>
        <View ref={ topRowRef } style={ styles.controlsRow }>
          { renderTopAction(isPlaying || status === 'loading' ? Pause : Play, togglePlayPause, TOP_ACTION_FOCUS_KEY) }
          { film.hasSeasons && (
            <>
              { renderTopAction(SkipBack, () => handleNewEpisode(RewindDirection.BACKWARD)) }
              { renderTopAction(SkipForward, () => handleNewEpisode(RewindDirection.FORWARD)) }
            </>
          ) }
          { renderTopAction(Gauge, openSpeedSelector) }
          { !isOffline && renderTopAction(MessageSquareText, handleOpenComments) }
          { renderTopAction(Undo2, backwardToStart) }
        </View>
      </FocusContext.Provider>
      { renderTopActionLine() }
    </View>
  );

  const renderProgressBar = () => {
    const { storyboardUrl } = video;

    return (
      <PlayerProgressBar
        player={ player }
        storyboardUrl={ storyboardUrl }
        calculateCurrentTime={ calculateCurrentTime }
        seekToPosition={ seekToPosition }
        thumbFocusKey={ PROGRESS_THUMB_FOCUS_KEY }
        onFocus={ () => updateFocusedElement(FocusedElement.PROGRESS_THUMB) }
        rewindPosition={ rewindPosition }
        togglePlayPause={ togglePlayPause }
        hideActions={ hideActions }
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
        <FocusContext.Provider value={ bottomRowFocusKey }>
          <View
            ref={ bottomRowRef }
            style={ {
              ...styles.controlsRow,
              ...(hideActions ? styles.controlsRowHidden : {}),
            } }
          >
            { renderBottomAction(Settings2, openQualitySelector, BOTTOM_ACTION_FOCUS_KEY) }
            { isPlaylistSelector && renderBottomAction(ListVideo, openVideoSelector) }
            { subtitles.length > 0 && renderBottomAction(
              // eslint-disable-next-line max-len
              !selectedSubtitle?.languageCode ? ClosedCaption : ClosedCaptionFilled({ color: theme.colors.iconOnContrast }),
              openSubtitleSelector
            ) }
            { !isOffline && renderBottomAction(isFilmBookmarked ? BookmarkCheck : Bookmark, openBookmarksOverlay) }
            { renderBottomAction(Maximize2, handleAspectRatioChange) }
          </View>
        </FocusContext.Provider>
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
      { renderProgressBar() }
      { renderBottomActions() }
    </Animated.View>
  );

  const renderLoader = () => (
    <Loader
      isLoading={ !hasPlaybackError && (isLoading || status === 'loading') }
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
      contentStyle={ styles.commentsOverlayContent }
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
    <Animated.View
      style={ [
        styles.container,
        isCommentsOpen && styles.containerWithComments,
      ] }
    >
      <VideoView
        style={ styles.video }
        player={ player }
        resizeMode={ selectedAspectRatio }
        controls={ false }
        pictureInPicture={ false }
      />
      { renderBackground() }
      { renderControls() }
      { renderLoader() }
      { renderError() }
      { renderModals() }
    </Animated.View>
  );
}

export default PlayerComponent;
