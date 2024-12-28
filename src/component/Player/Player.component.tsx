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
import { Pressable, View } from 'react-native';
import { Slider } from 'react-native-awesome-slider';
import { useSharedValue } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from 'Style/Colors';
import { scale } from 'Util/CreateStyles';
import { convertSecondsToTime } from 'Util/Date';

import { styles } from './Player.style';
import { PlayerComponentProps } from './Player.type';

export function PlayerComponent({
  player,
  status,
  film,
  togglePlayPause,
  rewindPosition,
  seekToPosition,
  calculateCurrentTime,
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
    const { progressPercentage, playablePercentage } = status;

    if (isSliding.current) {
      return;
    }

    progress.value = progressPercentage;
    cache.value = playablePercentage;
  }, [status]);

  const renderAction = (
    icon: string,
    _name: string,
    action?: () => void,
  ) => (
    <Pressable onPress={ action }>
      <ThemedIcon
        icon={ {
          name: icon,
          pack: IconPackType.MaterialIcons,
        } }
        size={ scale(36) }
        color="white"
      />
    </Pressable>
  );

  const renderTopInfo = () => {
    const { title } = film;

    return (
      <ThemedText>
        { title }
      </ThemedText>
    );
  };

  const renderTopActions = () => (
    <View style={ styles.topActions }>
      { renderTopInfo() }
      <View style={ styles.actionsRow }>
        { renderAction('speed', 'Speed') }
        { renderAction('comment', 'Comments') }
      </View>
    </View>
  );

  const renderMiddleControls = () => {
    const { isPlaying } = status;

    return (
      <View style={ styles.middleActions }>
        <Pressable
          style={ styles.control }
        >
          <ThemedIcon
            style={ styles.controlIcon }
            icon={ {
              name: 'skip-backward',
              pack: IconPackType.MaterialCommunityIcons,
            } }
            size={ scale(24) }
            color="white"
          />
        </Pressable>
        <Pressable
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
        </Pressable>
        <Pressable
          style={ styles.control }
        >
          <ThemedIcon
            style={ styles.controlIcon }
            icon={ {
              name: 'skip-forward',
              pack: IconPackType.MaterialCommunityIcons,
            } }
            size={ scale(24) }
            color="white"
          />
        </Pressable>
      </View>
    );
  };

  const renderDuration = () => {
    const { currentTime, durationTime, remainingTime } = status;

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
        { renderAction('high-quality', 'Quality') }
        { renderAction('playlist-play', 'Series') }
        { renderAction('subtitles', 'Subtitles') }
        { renderAction('bookmarks', 'Bookmarks') }
        { renderAction('share', 'Share') }
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
      </ThemedView>
    </SafeAreaView>
  );
}

export default PlayerComponent;
