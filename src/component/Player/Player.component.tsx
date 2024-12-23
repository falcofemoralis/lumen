import PlayerProgressBar from 'Component/PlayerProgressBar';
import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
import { ResizeMode, Video } from 'expo-av';
import React from 'react';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NotificationStore from 'Store/Notification.store';

import { styles } from './Player.style';
import { PlayerComponentProps } from './Player.type';

export function PlayerComponent({
  uri,
  onPlaybackStatusUpdate,
  playerRef,
  status,
  showControls,
  toggleControls,
  togglePlayPause,
  rewindPosition,
  seekToPosition,
}: PlayerComponentProps) {
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
        <PlayerProgressBar
          status={ status }
          playerRef={ playerRef }
          rewindPosition={ rewindPosition }
          seekToPosition={ seekToPosition }
          rewindPositionAuto={ () => {} }
        />
      </View>
    );
  };

  return (
    <SafeAreaView>
      <ThemedView style={ styles.container }>
        <Video
          style={ styles.video }
          ref={ playerRef }
          source={ { uri } }
          shouldPlay
          resizeMode={ ResizeMode.CONTAIN }
          onError={ (err) => {
            NotificationStore.displayError(err);
          } }
          useNativeControls={ false }
          onPlaybackStatusUpdate={ onPlaybackStatusUpdate }
          progressUpdateIntervalMillis={ 1000 }
        />
        <Pressable
          style={ styles.controlsContainer }
          onPress={ toggleControls }
        >
          { renderControls() }
        </Pressable>
      </ThemedView>
    </SafeAreaView>
  );
}

export default PlayerComponent;
