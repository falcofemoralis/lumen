import BookmarksSelector from 'Component/BookmarksSelector';
import Comments from 'Component/Comments';
import Loader from 'Component/Loader';
import PlayerDuration from 'Component/PlayerDuration';
import PlayerProgressBar from 'Component/PlayerProgressBar';
import PlayerSubtitles from 'Component/PlayerSubtitles';
import PlayerVideoSelector from 'Component/PlayerVideoSelector';
import ThemedDropdown from 'Component/ThemedDropdown';
import ThemedIcon from 'Component/ThemedIcon';
import { IconInterface, IconPackType } from 'Component/ThemedIcon/ThemedIcon.type';
import ThemedOverlay from 'Component/ThemedOverlay';
import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
import * as NavigationBar from 'expo-navigation-bar';
import * as ScreenOrientation from 'expo-screen-orientation';
import { OrientationLock } from 'expo-screen-orientation';
import { StatusBar } from 'expo-status-bar';
import { isPictureInPictureSupported, VideoView } from 'expo-video';
import { observer } from 'mobx-react-lite';
import React, {
  useEffect, useRef, useState,
} from 'react';
import { Dimensions, ScrollView, View } from 'react-native';
import {
  Gesture,
  GestureDetector,
  TouchableOpacity,
} from 'react-native-gesture-handler';
import {
  runOnJS,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import OverlayStore from 'Store/Overlay.store';
import { scale } from 'Util/CreateStyles';
import { setTimeoutSafe } from 'Util/Misc';

import {
  IN_PLAYER_BOOKMARKS_OVERLAY_ID,
  IN_PLAYER_COMMENTS_OVERLAY_ID,
  IN_PLAYER_VIDEO_SELECTOR_OVERLAY_ID,
  PLAYER_CONTROLS_ANIMATION,
  PLAYER_CONTROLS_TIMEOUT,
  QUALITY_OVERLAY_ID,
  RewindDirection,
  SUBTITLE_OVERLAY_ID,
} from './Player.config';
import { MiddleActionVariant, styles } from './Player.style';
import { PlayerComponentProps } from './Player.type';

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
}: PlayerComponentProps) {
  const [showControls, setShowControls] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);
  const canHideControls = useRef(isPlaying && showControls);
  const playerRef = useRef<VideoView>(null);

  const controlsAnimation = useAnimatedStyle(() => ({
    opacity: withTiming(showControls ? 1 : 0, { duration: PLAYER_CONTROLS_ANIMATION }),
  }));

  const handleHideControls = () => {
    canHideControls.current = isPlaying
      && showControls
      && !OverlayStore.currentOverlay.length
      && !isScrolling;
  };

  useEffect(() => {
    ScreenOrientation.lockAsync(OrientationLock.LANDSCAPE);
    NavigationBar.setVisibilityAsync('hidden');

    return () => {
      ScreenOrientation.unlockAsync();
      NavigationBar.setVisibilityAsync('visible');

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

  const handleIsScrolling = (value: boolean) => {
    setIsScrolling(value);
  };

  const singleTap = Gesture.Tap()
    .maxDuration(125)
    .onStart(() => {
      runOnJS(setShowControls)(!showControls);
      runOnJS(handleUserInteraction)();
    });

  const doubleTap = Gesture.Tap()
    .maxDuration(125)
    .numberOfTaps(2)
    .onStart((e) => {
      if (showControls) {
        return;
      }

      const { absoluteX } = e;

      if (absoluteX < (screenWidth / 2)) {
        runOnJS(rewindPosition)(RewindDirection.BACKWARD);
      } else {
        runOnJS(rewindPosition)(RewindDirection.FORWARD);
      }
    });

  const longPressGesture = Gesture.LongPress()
    .onStart(() => {
      runOnJS(setPlayerRate)(1.5);
    })
    .onEnd(() => {
      runOnJS(setPlayerRate)(1);
    });

  const renderAction = (
    icon: string,
    _name: string,
    action?: () => void,
  ) => (
    <GestureDetector gesture={ Gesture.Tap() }>
      <TouchableOpacity onPress={ () => handleUserInteraction(action) }>
        <ThemedIcon
          icon={ {
            name: icon,
            pack: IconPackType.MaterialCommunityIcons,
          } }
          size={ scale(28) }
          color="white"
        />
      </TouchableOpacity>
    </GestureDetector>
  );

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

  const renderTopInfo = () => (
    <View style={ styles.topInfo }>
      { renderTitle() }
      { renderSubtitle() }
    </View>
  );

  const enablePIP = () => {
    playerRef.current?.startPictureInPicture();
  };

  const renderTopActions = () => {
    const { subtitles = [] } = video;

    return (
      <View style={ styles.topActions }>
        { renderTopInfo() }
        <View style={ styles.actionsRow }>
          { isPictureInPictureSupported() && renderAction('picture-in-picture-bottom-right', 'PIP', enablePIP) }
          { renderAction('play-speed', 'Speed') }
          { renderAction('quality-high', 'Quality', openQualitySelector) }
          { subtitles.length > 0 && renderAction(
            selectedSubtitle?.languageCode === '' ? 'closed-caption-outline' : 'closed-caption',
            'Subtitles',
            openSubtitleSelector,
          ) }
          { renderAction('lock-open-outline', 'Lock') }
        </View>
      </View>
    );
  };

  const renderMiddleControl = (
    icon: IconInterface,
    action: () => void,
    size: MiddleActionVariant = 'small',
  ) => (
    <GestureDetector gesture={ Gesture.Tap() }>
      <TouchableOpacity
        style={ styles.control }
        onPress={ () => handleUserInteraction(action) }
      >
        <ThemedIcon
          style={ styles.controlIcon }
          icon={ icon }
          size={ scale(size === 'big' ? 36 : 24) }
          color="white"
        />
      </TouchableOpacity>
    </GestureDetector>
  );

  const renderMiddleControls = () => (
    <View style={ styles.middleActions }>
      { film.hasSeasons && renderMiddleControl(
        {
          name: 'skip-previous',
          pack: IconPackType.MaterialIcons,
        },
        () => handleNewEpisode(RewindDirection.BACKWARD),
      ) }
      { renderMiddleControl(
        {
          name: isPlaying ? 'pause' : 'play',
          pack: IconPackType.MaterialCommunityIcons,
        },
        togglePlayPause,
        'big',
      ) }
      { film.hasSeasons && renderMiddleControl(
        {
          name: 'skip-next',
          pack: IconPackType.MaterialIcons,
        },
        () => handleNewEpisode(RewindDirection.FORWARD),
      ) }
    </View>
  );

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
        <View style={ styles.progressBarRow }>
          { renderProgressBar() }
        </View>
        <View style={ styles.actionsRow }>
          { isPlaylistSelector && renderAction('playlist-play', 'Series', openVideoSelector) }
          { renderAction('comment-text-outline', 'Comments', () => OverlayStore.openOverlay(IN_PLAYER_COMMENTS_OVERLAY_ID)) }
          { renderAction('bookmark-outline', 'Bookmarks', () => OverlayStore.openOverlay(IN_PLAYER_BOOKMARKS_OVERLAY_ID)) }
          { renderAction('share-outline', 'Share') }
        </View>
      </View>
    );
  };

  const renderControls = () => (
    <GestureDetector
      gesture={ Gesture.Exclusive(
        doubleTap,
        singleTap,
        longPressGesture,
      ) }
    >
      <View style={ styles.controlsContainer }>
        <ThemedView.Animated style={ [
          styles.controls,
          controlsAnimation,
          !showControls && styles.controlsDisabled,
        ] }
        >
          { renderTopActions() }
          { renderMiddleControls() }
          { renderBottomActions() }
        </ThemedView.Animated>
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

  const renderCommentsOverlay = () => (
    <ThemedOverlay
      id={ IN_PLAYER_COMMENTS_OVERLAY_ID }
      onHide={ () => OverlayStore.goToPreviousOverlay() }
      containerStyle={ styles.commentsOverlay }
    >
      <ScrollView
        horizontal
        contentContainerStyle={ { width: '100%', height: '100%' } }
      >
        <Comments
          style={ styles.commentsOverlayContent }
          film={ film }
        />
      </ScrollView>
    </ThemedOverlay>
  );

  const renderBookmarksOverlay = () => (
    <BookmarksSelector
      overlayId={ IN_PLAYER_BOOKMARKS_OVERLAY_ID }
      film={ film }
    />
  );

  const renderModals = () => (
    <>
      { renderQualitySelector() }
      { renderPlayerVideoSelector() }
      { renderSubtitlesSelector() }
      { renderCommentsOverlay() }
      { renderBookmarksOverlay() }
    </>
  );

  return (
    <View>
      <StatusBar
        hidden
        animated
      />
      <ThemedView style={ styles.container }>
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
      </ThemedView>
    </View>
  );
}

export default observer(PlayerComponent);
