import Loader from 'Component/Loader';
import ThemedDropdown from 'Component/ThemedDropdown';
import ThemedIcon from 'Component/ThemedIcon';
import { IconPackType } from 'Component/ThemedIcon/ThemedIcon.type';
import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
import * as NavigationBar from 'expo-navigation-bar';
import * as ScreenOrientation from 'expo-screen-orientation';
import { OrientationLock } from 'expo-screen-orientation';
import { StatusBar } from 'expo-status-bar';
import { VideoView } from 'expo-video';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, TouchableOpacity, View } from 'react-native';
import { Slider } from 'react-native-awesome-slider';
import { useSharedValue } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from 'Style/Colors';
import { scale } from 'Util/CreateStyles';
import { convertSecondsToTime } from 'Util/Date';

import { QUALITY_OVERLAY_ID, RewindDirection } from './Player.config';
import { styles } from './Player.style';
import { PlayerComponentProps } from './Player.type';

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
}: PlayerComponentProps) {
  const [showControls, setShowControls] = useState(false);
  const progress = useSharedValue(0);
  const cache = useSharedValue(0);
  const minimumValue = useSharedValue(0);
  const maximumValue = useSharedValue(100);
  const isSliding = useRef(false);

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

  const renderAction = (
    icon: string,
    _name: string,
    action?: () => void,
  ) => (
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

  const renderMiddleControls = () => (
    <View style={ styles.middleActions }>
      { film.hasSeasons && (
        <TouchableOpacity
          style={ styles.control }
          onPress={ () => handleNewEpisode(RewindDirection.Backward) }
        >
          <ThemedIcon
            style={ styles.controlIcon }
            icon={ {
              name: 'skip-previous',
              pack: IconPackType.MaterialIcons,
            } }
            size={ scale(24) }
            color="white"
          />
        </TouchableOpacity>
      ) }
      <TouchableOpacity
        style={ styles.control }
        onPress={ togglePlayPause }
      >
        <ThemedIcon
          style={ styles.controlIcon }
          icon={ {
            name: isPlaying ? 'pause' : 'play',
            pack: IconPackType.MaterialCommunityIcons,
          } }
          size={ scale(36) }
          color="white"
        />
      </TouchableOpacity>
      { film.hasSeasons && (
        <TouchableOpacity
          style={ styles.control }
          onPress={ () => handleNewEpisode(RewindDirection.Forward) }
        >
          <ThemedIcon
            style={ styles.controlIcon }
            icon={ {
              name: 'skip-next',
              pack: IconPackType.MaterialIcons,
            } }
            size={ scale(24) }
            color="white"
          />
        </TouchableOpacity>
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
        { film.hasSeasons && (
          renderAction('playlist-play', 'Series')
        ) }
        { renderAction('comment-text-outline', 'Comments') }
        { renderAction('bookmark-outline', 'Bookmarks') }
        { renderAction('share-outline', 'Share') }
      </View>
    </View>
  );

  const renderControls = () => {
    if (!showControls) {
      return null;
    }

    return (
      <View style={ styles.controls }>
        { renderTopActions() }
        { renderMiddleControls() }
        { renderBottomActions() }
      </View>
    );
  };

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
        containerStyle={ styles.overlayContainer }
      />
    );
  };

  const renderModals = () => renderQualitySelector();

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
        <Pressable
          style={ styles.controlsContainer }
          onPress={ () => setShowControls(!showControls) }
        >
          { renderControls() }
        </Pressable>
        { renderLoader() }
        { renderModals() }
      </ThemedView>
    </SafeAreaView>
  );
}

export default PlayerComponent;
