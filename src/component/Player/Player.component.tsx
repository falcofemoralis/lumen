import Slider from '@react-native-community/slider';
import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
import * as NavigationBar from 'expo-navigation-bar';
import * as ScreenOrientation from 'expo-screen-orientation';
import { OrientationLock } from 'expo-screen-orientation';
import { StatusBar } from 'expo-status-bar';
import { VideoView } from 'expo-video';
import React, { useEffect, useState } from 'react';
import { DimensionValue, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { styles } from './Player.style';
import { PlayerComponentProps } from './Player.type';

export function PlayerComponent({
  player,
  playerRef,
  status,
  film,
  togglePlayPause,
  rewindPosition,
  seekToPosition,
}: PlayerComponentProps) {
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    ScreenOrientation.lockAsync(OrientationLock.LANDSCAPE);
    NavigationBar.setVisibilityAsync('hidden');

    return () => {
      ScreenOrientation.unlockAsync();
      NavigationBar.setVisibilityAsync('visible');
    };
  }, []);

  const renderProgressBar = () => {
    const {
      progressPercentage,
      playablePercentage,
    } = status;

    return (
      <View style={ styles.progressBarContainer }>
        <Slider
          style={ styles.progressBar }
          value={ progressPercentage }
          minimumValue={ 0 }
          maximumValue={ 100 }
          minimumTrackTintColor="#FFFF00"
          maximumTrackTintColor="#ffffff00"
          onSlidingComplete={ seekToPosition }
        />
        <View
          style={ {
            ...styles.playableBar,
            width: (`${playablePercentage}%`) as DimensionValue,
          } }
        />
      </View>
    );
  };

  const renderControls = () => {
    if (!showControls) {
      return null;
    }

    return (
      <View style={ styles.controls }>
        <Pressable
          style={ styles.playControl }
          onPress={ togglePlayPause }
        >
          <ThemedText>{ status.isPlaying ? 'Pause' : 'Play' }</ThemedText>
        </Pressable>
        { renderProgressBar() }
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
          ref={ playerRef }
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
