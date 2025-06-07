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
import ThemedPressable from 'Component/ThemedPressable';
import ThemedText from 'Component/ThemedText';
import { useOverlayContext } from 'Context/OverlayContext';
import * as NavigationBar from 'expo-navigation-bar';
import * as ScreenOrientation from 'expo-screen-orientation';
import { OrientationLock } from 'expo-screen-orientation';
import * as StatusBar from 'expo-status-bar';
import { isPictureInPictureSupported, VideoView } from 'expo-video';
import t from 'i18n/t';
import {
  Bookmark,
  Captions,
  CaptionsOff,
  Forward,
  Gauge,
  ListVideo,
  LockKeyhole,
  LockKeyholeOpen,
  MessageSquareText,
  Pause,
  PictureInPicture2,
  Play,
  SkipBack,
  SkipForward,
  Sparkles,
} from 'lucide-react-native';
import React, {
  useEffect, useRef, useState,
} from 'react';
import { Dimensions, ScrollView, View } from 'react-native';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from 'Style/Colors';
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
  isLocked,
  togglePlayPause,
  seekToPosition,
  calculateCurrentTime,
  handleNewEpisode,
  handleQualityChange,
  openQualitySelector,
  openVideoSelector,
  hideVideoSelector,
  handleVideoSelect,
  rewindPosition,
  setPlayerRate,
  openSubtitleSelector,
  handleSubtitleChange,
  handleSpeedChange,
  openSpeedSelector,
  openBookmarksOverlay,
  openCommentsOverlay,
  handleLockControls,
  handleShare,
}: PlayerComponentProps) {
  const { currentOverlay, goToPreviousOverlay } = useOverlayContext();
  const [showControls, setShowControls] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [doubleTapAction, setDoubleTapAction] = useState<DoubleTapAction | null>(null);
  const [longTapAction, setLongTapAction] = useState(false);
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);
  const canHideControls = useRef(isPlaying && showControls);
  const playerRef = useRef<VideoView>(null);
  const doubleTapTimeout = useRef<NodeJS.Timeout | null>(null);

  const controlsAnimation = useAnimatedStyle(() => ({
    opacity: withTiming(showControls ? 1 : 0, { duration: PLAYER_CONTROLS_ANIMATION }),
  }));

  const handleHideControls = () => {
    canHideControls.current = isPlaying
      && showControls
      && !currentOverlay.length
      && !isScrolling;
  };

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

  useEffect(() => {
    handleHideControls();
  }, [isPlaying, showControls, isScrolling]);

  useEffect(() => {
    handleHideControls();

    if (canHideControls.current) {
      handleUserInteraction();
    }
  }, [currentOverlay.length]);

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

  const handleIsScrolling = (value: boolean) => {
    setIsScrolling(value);
  };

  const handleDoubleTap = (direction: RewindDirection) => {
    const seconds = DEFAULT_REWIND_SECONDS;

    rewindPosition(direction, seconds);
    setDoubleTapAction({
      seconds: seconds + (doubleTapAction?.seconds ?? 0),
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
      runOnJS(setShowControls)(!showControls);
      runOnJS(handleUserInteraction)();
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd((e) => {
      if (showControls || isLocked) {
        return;
      }

      const { absoluteX } = e;

      if (absoluteX < (screenWidth / 2)) {
        runOnJS(handleDoubleTap)(RewindDirection.BACKWARD);
      } else {
        runOnJS(handleDoubleTap)(RewindDirection.FORWARD);
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

    return renderAction(selectedSubtitle?.languageCode === '' ? Captions : CaptionsOff, openSubtitleSelector);
  };

  const renderTopActions = () => (
    <View style={ styles.topActions }>
      { renderTopInfo() }
      <View style={ styles.actionsRow }>
        { !isLocked && (
          <>
            { isPictureInPictureSupported() && renderAction(PictureInPicture2, enablePIP) }
            { renderAction(Gauge, openSpeedSelector) }
            { renderAction(Sparkles, openQualitySelector) }
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
          isPlaying || isLoading ? Pause : Play,
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
          <PlayerClock />
          <View
            style={ [
              styles.actionsRow,
              styles.bottomActionsRow,
              isLocked && styles.bottomActionsRowLocked,
            ] }
          >
            { isPlaylistSelector && renderAction(ListVideo, openVideoSelector) }
            { renderAction(MessageSquareText, openCommentsOverlay) }
            { renderAction(Bookmark, openBookmarksOverlay) }
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
      contentContainerStyle={ styles.commentsOverlayContent }
    >
      <ScrollView
        horizontal
        contentContainerStyle={ { width: '100%', height: '100%' } }
      >
        <Comments
          style={ styles.commentsOverlayList }
          film={ film }
          loaderFullScreen
        />
      </ScrollView>
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
