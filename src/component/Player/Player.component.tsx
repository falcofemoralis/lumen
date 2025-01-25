import Loader from 'Component/Loader';
import PlayerVideoSelector from 'Component/PlayerVideoSelector';
import ThemedDropdown from 'Component/ThemedDropdown';
import ThemedIcon from 'Component/ThemedIcon';
import { IconInterface, IconPackType } from 'Component/ThemedIcon/ThemedIcon.type';
import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
import * as NavigationBar from 'expo-navigation-bar';
import * as ScreenOrientation from 'expo-screen-orientation';
import { OrientationLock } from 'expo-screen-orientation';
import { StatusBar } from 'expo-status-bar';
import { VideoView } from 'expo-video';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, View } from 'react-native';
import { Slider } from 'react-native-awesome-slider';
import {
  Gesture,
  GestureDetector,
  TouchableOpacity,
} from 'react-native-gesture-handler';
import {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from 'Style/Colors';
import { scale } from 'Util/CreateStyles';
import { convertSecondsToTime } from 'Util/Date';

import { QUALITY_OVERLAY_ID, RewindDirection } from './Player.config';
import { styles } from './Player.style';
import { PlayerComponentProps } from './Player.type';

const { width: screenWidth } = Dimensions.get('window');

export function PlayerComponent({
  player,
  isLoading,
  isPlaying,
  progressStatus,
  video,
  film,
  voice,
  selectedQuality,
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
}: PlayerComponentProps) {
  const [showControls, setShowControls] = useState(false);
  const progress = useSharedValue(0);
  const cache = useSharedValue(0);
  const minimumValue = useSharedValue(0);
  const maximumValue = useSharedValue(100);
  const isSliding = useRef(false);

  const controlsAnimation = useAnimatedStyle(() => ({
    opacity: withTiming(showControls ? 1 : 0, { duration: 150 }),
  }));

  useEffect(() => {
    ScreenOrientation.lockAsync(OrientationLock.LANDSCAPE);
    NavigationBar.setVisibilityAsync('hidden');

    return () => {
      ScreenOrientation.unlockAsync();
      NavigationBar.setVisibilityAsync('visible');
    };
  }, []);

  useEffect(() => {
    const { progressPercentage, playablePercentage } = progressStatus;

    if (isSliding.current) {
      return;
    }

    progress.value = progressPercentage;
    cache.value = playablePercentage;
  }, [progressStatus]);

  const singleTap = Gesture.Tap()
    .maxDuration(150)
    .onStart((e) => {
      console.log('single tap');
      console.log(e);

      runOnJS(setShowControls)(!showControls);
    });

  const doubleTap = Gesture.Tap()
    .maxDuration(250)
    .numberOfTaps(2)
    .onStart((e) => {
      if (showControls) {
        return;
      }

      const { absoluteX } = e;

      if (absoluteX < (screenWidth / 2)) {
        runOnJS(rewindPosition)(RewindDirection.Backward);
      } else {
        runOnJS(rewindPosition)(RewindDirection.Forward);
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
      <TouchableOpacity onPress={ action }>
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

  const renderTopActions = () => (
    <View style={ styles.topActions }>
      { renderTopInfo() }
      <View style={ styles.actionsRow }>
        { renderAction('play-speed', 'Speed') }
        { renderAction('quality-high', 'Quality', openQualitySelector) }
        { renderAction(true ? 'closed-caption-outline' : 'closed-caption', 'Subtitles') }
        { renderAction('lock-open-outline', 'Lock') }
      </View>
    </View>
  );

  const renderMiddleControl = (
    icon: IconInterface,
    action: () => void,
    size: number,
  ) => (
    <GestureDetector gesture={ Gesture.Tap() }>
      <TouchableOpacity
        style={ styles.control }
        onPress={ action }
      >
        <ThemedIcon
          style={ styles.controlIcon }
          icon={ icon }
          size={ scale(size) }
          color="white"
        />
      </TouchableOpacity>
    </GestureDetector>
  );

  const renderMiddleControls = () => (
    <View style={ styles.middleActions }>
      { film.hasSeasons && renderMiddleControl(
        { name: 'skip-previous', pack: IconPackType.MaterialIcons },
        () => handleNewEpisode(RewindDirection.Backward),
        24,
      ) }
      { renderMiddleControl(
        { name: isPlaying ? 'pause' : 'play', pack: IconPackType.MaterialCommunityIcons },
        togglePlayPause,
        36,
      ) }
      { film.hasSeasons && renderMiddleControl(
        { name: 'skip-next', pack: IconPackType.MaterialIcons },
        () => handleNewEpisode(RewindDirection.Forward),
        24,
      ) }
    </View>
  );

  const renderDuration = () => {
    const { currentTime, durationTime, remainingTime } = progressStatus;

    return (
      <ThemedText>
        { `${currentTime} / ${durationTime} (${remainingTime})` }
      </ThemedText>
    );
  };

  const renderProgressBar = () => (
    <Slider
      progress={ progress }
      cache={ cache }
      minimumValue={ minimumValue }
      maximumValue={ maximumValue }
      bubble={
        (value) => convertSecondsToTime(calculateCurrentTime(value))
      }
      onSlidingStart={ () => {
        isSliding.current = true;
      } }
      onSlidingComplete={ (value) => {
        isSliding.current = false;
        seekToPosition(value);
      } }
      theme={ {
        minimumTrackTintColor: Colors.secondary,
        cacheTrackTintColor: '#888888aa',
        maximumTrackTintColor: '#555555aa',
        bubbleBackgroundColor: Colors.secondary,
      } }
    />
  );

  const renderBottomActions = () => (
    <View style={ styles.bottomActions }>
      <View style={ styles.durationRow }>
        { renderDuration() }
      </View>
      <View style={ styles.progressBarRow }>
        { renderProgressBar() }
      </View>
      <View style={ styles.actionsRow }>
        { renderAction('playlist-play', 'Series', openVideoSelector) }
        { renderAction('comment-text-outline', 'Comments') }
        { renderAction('bookmark-outline', 'Bookmarks') }
        { renderAction('share-outline', 'Share') }
      </View>
    </View>
  );

  const renderControls = () => (
    <GestureDetector
      gesture={ Gesture.Exclusive(doubleTap,
        singleTap,
        longPressGesture) }
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
        asList
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

  const renderPlayerVideoSelector = () => {
    const { voices = [], hasVoices, hasSeasons } = film;

    if (!voices.length || (!hasVoices && !hasSeasons)) {
      return null;
    }

    return (
      <PlayerVideoSelector
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
    <SafeAreaView>
      <StatusBar
        hidden
        animated
      />
      <ThemedView style={ styles.container }>
        <VideoView
          style={ styles.video }
          player={ player }
          contentFit="contain"
          nativeControls={ false }
          allowsPictureInPicture={ false }
        />
        { renderControls() }
        { renderLoader() }
        { renderModals() }
      </ThemedView>
    </SafeAreaView>
  );
}

export default PlayerComponent;
