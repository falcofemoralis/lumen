import BookmarksSelector from 'Component/BookmarksSelector';
import Comments from 'Component/Comments';
import Loader from 'Component/Loader';
import PlayerDuration from 'Component/PlayerDuration';
import PlayerProgressBar from 'Component/PlayerProgressBar';
import PlayerSubtitles from 'Component/PlayerSubtitles';
import PlayerVideoSelector from 'Component/PlayerVideoSelector';
import ThemedDropdown from 'Component/ThemedDropdown';
import ThemedIcon from 'Component/ThemedIcon';
import { IconPackType } from 'Component/ThemedIcon/ThemedIcon.type';
import ThemedOverlay from 'Component/ThemedOverlay';
import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
import { LinearGradient } from 'expo-linear-gradient';
import { VideoView } from 'expo-video';
import __ from 'i18n/__';
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
  PLAYER_CONTROLS_ANIMATION,
  PLAYER_CONTROLS_TIMEOUT,
  RewindDirection,
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
  qualityOverlayId,
  subtitleOverlayId,
  playerVideoSelectorOverlayId,
  commentsOverlayId,
  bookmarksOverlayId,
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

  const handleHideControls = () => {
    canHideControls.current = isPlaying
    && showControls
    && !OverlayStore.currentOverlay.length;
  };

  useEffect(() => () => {
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
  }, []);

  useEffect(() => {
    handleHideControls();
  }, [isPlaying, showControls]);

  useEffect(() => {
    handleHideControls();

    if (canHideControls.current) {
      handleUserInteraction();
    }
  }, [OverlayStore.currentOverlay.length]);

  useEffect(() => {
    const keyDownListener = (type: SupportedKeys) => {
      if (!showControls) {
        if (type === SupportedKeys.BACK) {
          return false;
        }

        if (type === SupportedKeys.UP) {
          PlayerStore.setFocusedElement(FocusedElement.TOP_ACTION);
          topActionRef.current?.focus();
        }

        if (type === SupportedKeys.ENTER
          || type === SupportedKeys.LEFT
          || type === SupportedKeys.RIGHT
        ) {
          PlayerStore.setFocusedElement(FocusedElement.PROGRESS_THUMB);
          middleActionRef.current?.focus();

          if (type === SupportedKeys.LEFT || type === SupportedKeys.RIGHT) {
            return true;
          }
        }

        if (type === SupportedKeys.DOWN) {
          PlayerStore.setFocusedElement(FocusedElement.BOTTOM_ACTION);
          bottomActionRef.current?.focus();
        }

        setShowControls(true);

        return true;
      }

      if (PlayerStore.focusedElement === FocusedElement.PROGRESS_THUMB) {
        if (type === SupportedKeys.ENTER) {
          togglePlayPause();
        }

        if ((type === SupportedKeys.UP || type === SupportedKeys.DOWN) && hideActions) {
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
          `${title}${hasSeasons ? ` ${__('Season %s - Episode %s', voice.lastSeasonId, voice.lastEpisodeId)}` : ''}`
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
    FocusedElement.TOP_ACTION,
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
    FocusedElement.BOTTOM_ACTION,
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
        isPlaying || isLoading ? 'pause' : 'play-arrow',
        'Play',
        togglePlayPause,
        topActionRef,
      ) }
      { renderTopAction('fast-rewind', 'Rewind') }
      { renderTopAction('fast-forward', 'Forward') }
      { film.hasSeasons && (
        <>
          { renderTopAction('skip-previous', 'Previous', () => handleNewEpisode(RewindDirection.BACKWARD)) }
          { renderTopAction('skip-next', 'Next', () => handleNewEpisode(RewindDirection.FORWARD)) }
        </>
      ) }
      { renderTopAction('speed', 'Speed') }
      { renderTopAction('comment', 'Comments', () => OverlayStore.openOverlay(commentsOverlayId)) }
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
          PlayerStore.setFocusedElement(FocusedElement.PROGRESS_THUMB);
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
          { renderBottomAction('high-quality', 'Quality', openQualitySelector, bottomActionRef) }
          { isPlaylistSelector && renderBottomAction('playlist-play', 'Series', openVideoSelector) }
          { subtitles.length > 0 && renderBottomAction('subtitles', 'Subtitles', openSubtitleSelector) }
          { renderBottomAction('bookmarks', 'Bookmarks', () => OverlayStore.openOverlay(bookmarksOverlayId)) }
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
        overlayId={ qualityOverlayId }
        header={ __('Quality') }
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
        header={ __('Subtitles') }
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
      onHide={ () => OverlayStore.goToPreviousOverlay() }
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
