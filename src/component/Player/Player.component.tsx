import BookmarksOverlay from 'Component/BookmarksOverlay';
import CommentsOverlay from 'Component/CommentsOverlay';
import Loader from 'Component/Loader';
import PlayerClock from 'Component/PlayerClock';
import PlayerDuration from 'Component/PlayerDuration';
import PlayerProgressBar from 'Component/PlayerProgressBar';
import PlayerSubtitles from 'Component/PlayerSubtitles';
import PlayerVideoSelector from 'Component/PlayerVideoSelector';
import ThemedDropdown from 'Component/ThemedDropdown';
import ThemedPressable from 'Component/ThemedPressable';
import ThemedText from 'Component/ThemedText';
import * as NavigationBar from 'expo-navigation-bar';
import * as ScreenOrientation from 'expo-screen-orientation';
import { OrientationLock } from 'expo-screen-orientation';
import * as StatusBar from 'expo-status-bar';
import { isPictureInPictureSupported, VideoView } from 'expo-video';
import t from 'i18n/t';
import {
  Bookmark,
  BookmarkCheck,
  ClosedCaption,
  Forward,
  Gauge,
  ListVideo,
  LockKeyhole,
  LockKeyholeOpen,
  MessageSquareText,
  Pause,
  PictureInPicture2,
  Play,
  Settings2,
  SkipBack,
  SkipForward,
} from 'lucide-react-native';
import React, {
  useEffect, useRef, useState,
} from 'react';
import { Dimensions, View } from 'react-native';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { Colors } from 'Style/Colors';
import { ClosedCaptionFilled } from 'Style/Icons';
import { scale } from 'Util/CreateStyles';
import { setTimeoutSafe } from 'Util/Misc';

import {
  DEFAULT_REWIND_SECONDS,
  DEFAULT_SPEED,
  DEFAULT_SPEEDS,
  DOUBLE_TAP_ANIMATION,
  PLAYER_CONTROLS_ANIMATION,
  PLAYER_CONTROLS_TIMEOUT,
  RewindDirection,
} from './Player.config';
import { MiddleActionVariant, styles } from './Player.style';
import { DoubleTapAction, PlayerComponentProps } from './Player.type';

const { width: screenWidth } = Dimensions.get('window');

export function PlayerComponent({
  player,
  status,
  isPlaying,
  video,
  film,
  voice,
  selectedQuality,
  selectedSubtitle,
  qualityOverlayRef,
  subtitleOverlayRef,
  playerVideoSelectorOverlayRef,
  commentsOverlayRef,
  bookmarksOverlayRef,
  speedOverlayRef,
  selectedSpeed,
  isLocked,
  isOverlayOpen,
  isFilmBookmarked,
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
  openBookmarksOverlay,
  openCommentsOverlay,
  handleLockControls,
  handleShare,
  closeOverlay,
  onBookmarkChange,
}: PlayerComponentProps) {
  const [showControls, setShowControls] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [doubleTapAction, setDoubleTapAction] = useState<DoubleTapAction | null>(null);
  const [longTapAction, setLongTapAction] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);
  const playerRef = useRef<VideoView>(null);
  const doubleTapTimeout = useRef<NodeJS.Timeout | null>(null);
  const isPlayingRef = useRef(isPlaying);
  const showControlsRef = useRef(showControls);
  const isOverlayOpenRef = useRef(isOverlayOpen);
  const isScrollingRef = useRef(isScrolling);
  const isComponentMounted = useRef(true);

  const controlsAnimation = useAnimatedStyle(() => ({
    opacity: withTiming(showControls ? 1 : 0, { duration: PLAYER_CONTROLS_ANIMATION }),
  }));

  const setControlsTimeout = () => {
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }

    controlsTimeout.current = setTimeoutSafe(() => {
      if (!isComponentMounted.current) return;

      if (isPlayingRef.current
        && showControlsRef.current
        && !isOverlayOpenRef.current
        && !isScrollingRef.current
      ) {
        setShowControls(false);
      }
    }, PLAYER_CONTROLS_TIMEOUT);
  };

  useEffect(() => {
    isPlayingRef.current = isPlaying;
    showControlsRef.current = showControls;
    isScrollingRef.current = isScrolling;
    isOverlayOpenRef.current = isOverlayOpen;
  }, [showControls, isOverlayOpen, isScrolling, isPlaying]);

  useEffect(() => {
    return () => {
      isComponentMounted.current = false;
    };
  }, []);

  useEffect(() => {
    setControlsTimeout();
  }, [isPlaying, isOverlayOpen, player]);

  useEffect(() => {
    ScreenOrientation.lockAsync(OrientationLock.LANDSCAPE);
    NavigationBar.setVisibilityAsync('hidden');
    StatusBar.setStatusBarHidden(true, 'slide');

    return () => {
      ScreenOrientation.unlockAsync();
      NavigationBar.setVisibilityAsync('visible');
      StatusBar.setStatusBarHidden(false, 'slide');

      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
    };
  }, []);

  const handleUserInteraction = (action?: () => void) => {
    setControlsTimeout();

    if (action) {
      action();
    }
  };

  const handleIsScrolling = (value: boolean) => {
    setIsScrolling(value);
  };

  const handleOpenComments = () => {
    setShowControls(false);
    setIsCommentsOpen(true);

    setTimeout(() => {
      openCommentsOverlay();
    }, 250);
  };

  const handleDoubleTap = (direction: RewindDirection) => {
    const seconds = DEFAULT_REWIND_SECONDS;

    rewindPosition(direction, seconds);
    setDoubleTapAction({
      seconds: doubleTapAction?.direction === direction ? seconds + (doubleTapAction?.seconds ?? 0) : seconds,
      direction,
    });

    if (doubleTapTimeout.current) {
      clearTimeout(doubleTapTimeout.current);
    }

    doubleTapTimeout.current = setTimeoutSafe(() => {
      setDoubleTapAction(null);
    }, DOUBLE_TAP_ANIMATION);
  };

  const singleTap = Gesture.Tap()
    .onEnd(() => {
      scheduleOnRN(setShowControls, !showControls);
      scheduleOnRN(handleUserInteraction);
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
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
    });

  // const longPressGesture = Gesture.LongPress()
  //   .onStart(() => {
  //     if (showControls || isLocked || !isPlaying) {
  //       return;
  //     }

  //     runOnJS(setPlayerRate)(1.5);
  //     runOnJS(setLongTapAction)(true);
  //   })
  //   .onEnd(() => {
  //     runOnJS(setPlayerRate)(1);
  //     runOnJS(setLongTapAction)(false);
  //   });

  const enablePIP = () => {
    playerRef.current?.startPictureInPicture();
  };

  const renderAction = (
    IconComponent: React.ComponentType<any>,
    action?: () => void
  ) => (
    <GestureDetector gesture={ Gesture.Tap() }>
      <ThemedPressable
        style={ styles.action }
        onPress={ () => handleUserInteraction(action) }
      >
        <IconComponent
          size={ scale(28) }
          color={ Colors.white }
        />
      </ThemedPressable>
    </GestureDetector>
  );

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
    <View style={ styles.topInfo }>
      { renderTitle() }
      { renderSubtitle() }
    </View>
  );

  const renderSubtitlesActions = () => {
    const { subtitles = [] } = video;

    if (!subtitles.length) {
      return null;
    }

    return renderAction(
      selectedSubtitle?.languageCode === '' ? ClosedCaption : ClosedCaptionFilled,
      openSubtitleSelector
    );
  };

  const renderTopActions = () => (
    <View style={ styles.topActions }>
      { renderTopInfo() }
      <View style={ styles.actionsRow }>
        { !isLocked && (
          <>
            { isPictureInPictureSupported() && renderAction(PictureInPicture2, enablePIP) }
            { renderAction(Gauge, openSpeedSelector) }
            { renderAction(Settings2, openQualitySelector) }
            { renderSubtitlesActions() }
          </>
        ) }
        { renderAction(!isLocked ? LockKeyholeOpen : LockKeyhole, handleLockControls) }
      </View>
    </View>
  );

  const renderMiddleControl = (
    IconComponent: React.ComponentType<any>,
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
          color={ Colors.white }
        />
      </ThemedPressable>
    </GestureDetector>
  );

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
          isPlaying || status === 'loading' ? Pause : Play,
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

  const renderDuration = () => (
    <PlayerDuration />
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

  const renderTopActionLine = () => {
    return (
      <View style={ styles.topActionLine }>
        <PlayerClock />
        <ThemedText>
          { selectedQuality }
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
          { renderDuration() }
        </View>
        <View style={ [styles.progressBarRow, isLocked && styles.progressBarRowLocked] }>
          { renderProgressBar() }
        </View>
        <View style={ styles.bottomActionsRowLine }>
          { renderTopActionLine() }
          <View
            style={ [
              styles.actionsRow,
              styles.bottomActionsRow,
              isLocked && styles.bottomActionsRowLocked,
            ] }
          >
            { isPlaylistSelector && renderAction(ListVideo, openVideoSelector) }
            { renderAction(MessageSquareText, handleOpenComments) }
            { renderAction(isFilmBookmarked ? BookmarkCheck : Bookmark, openBookmarksOverlay) }
            { renderAction(Forward, handleShare) }
          </View>
        </View>
      </View>
    );
  };

  const renderDoubleTapAction = () => {
    if (!doubleTapAction) {
      return null;
    }

    const { seconds, direction } = doubleTapAction;

    return (
      <View style={ [
        styles.doubleTapAction,
        {
          left: direction === RewindDirection.BACKWARD ? '20%' : '80%',
        },
      ] }
      >
        <View style={ [
          styles.doubleTapContainer,
          {
            flexDirection: direction === RewindDirection.BACKWARD ? 'row-reverse' : 'row',
          },
        ] }
        >
          { /* <ThemedIcon
            style={ styles.doubleTapIcon }
            icon={ {
              name: direction === RewindDirection.BACKWARD ? 'rewind-outline' : 'fast-forward-outline',
              pack: IconPackType.MaterialCommunityIcons,
            } }
            size={ scale(24) }
            color="white"
          /> */ }
          <ThemedText style={ styles.longTapText }>
            { `${direction === RewindDirection.BACKWARD ? '-' : '+'}${seconds}` }
          </ThemedText>
        </View>
      </View>
    );
  };

  const renderLongTapAction = () => {
    if (!longTapAction) {
      return null;
    }

    return (
      <View style={ styles.longTapAction }>
        <View style={ styles.longTapContainer }>
          <ThemedText style={ styles.longTapText }>
            2x
          </ThemedText>
          { /* <ThemedIcon
            style={ styles.longTapIcon }
            icon={ {
              name: 'fast-forward-outline',
              pack: IconPackType.MaterialCommunityIcons,
            } }
            size={ scale(24) }
            color="white"
          /> */ }
        </View>
      </View>
    );
  };

  const renderControls = () => (
    <GestureDetector
      gesture={ Gesture.Exclusive(
        doubleTap,
        singleTap
        // longPressGesture,
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
      </View>
    </GestureDetector>
  );

  const renderLoader = () => (
    <Loader
      isLoading={ status === 'loading' }
      fullScreen
    />
  );

  const renderQualitySelector = () => {
    const { streams } = video;

    return (
      <ThemedDropdown
        asOverlay
        overlayRef={ qualityOverlayRef }
        header={ t('Quality') }
        value={ selectedQuality }
        data={ streams.map((stream) => ({
          label: stream.quality,
          value: stream.quality,
        })).reverse() }
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
        overlayRef={ playerVideoSelectorOverlayRef }
        film={ film }
        onSelect={ handleVideoSelect }
        voice={ voice }
        onClose={ closeOverlay }
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
        value={ selectedSubtitle?.languageCode }
        data={ subtitles.map((subtitle) => ({
          label: subtitle.name,
          value: subtitle.languageCode,
        })) }
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
    <View
      style={ [
        styles.container,
        isCommentsOpen && { width: (Dimensions.get('window').width) / 2 },
      ] }
    >
      <VideoView
        ref={ playerRef }
        style={ styles.video }
        player={ player }
        contentFit="contain"
        nativeControls={ false }
        allowsPictureInPicture={ isPictureInPictureSupported() }
      />
      { renderSubtitles() }
      { renderControls() }
      { renderLoader() }
      { renderModals() }
    </View>
  );
}

export default PlayerComponent;
