import PlayerProgressBar from 'Component/PlayerProgressBar';
import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
import { ResizeMode, Video } from 'expo-av';
import React from 'react';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SOURCE } from './Player.config';
import { styles } from './Player.style';
import { PlayerComponentProps } from './Player.type';
import Slider from '@react-native-community/slider';

export function PlayerComponent(props: PlayerComponentProps) {
  const {
    onPlaybackStatusUpdate,
    playerRef,
    status,
    showControls,
    toggleControls,
    togglePlayPause,
  } = props;

  const renderControls = () => {
    if (!showControls) {
      return null;
    }

    return (
      <View style={styles.controls}>
        <Pressable
          style={styles.playControl}
          onPress={togglePlayPause}
        >
          <ThemedText>{status.isPlaying ? 'Pause' : 'Play'}</ThemedText>
        </Pressable>
        <PlayerProgressBar
          status={status}
          playerRef={playerRef}
        />
      </View>
    );
  };

  return (
    <SafeAreaView>
      <ThemedView style={styles.container}>
        <Video
          style={styles.video}
          ref={playerRef}
          source={{ uri: SOURCE }}
          shouldPlay={true}
          resizeMode={ResizeMode.CONTAIN}
          onError={(err) => {
            console.log('Video ERROR', err);
          }}
          useNativeControls={false}
          onPlaybackStatusUpdate={onPlaybackStatusUpdate}
        />
        <View
          style={styles.controlsContainer}
          // onPress={toggleControls}
        >
          {renderControls()}
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}

export default PlayerComponent;
