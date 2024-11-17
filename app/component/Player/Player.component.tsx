import PlayerProgressBar from 'Component/PlayerProgressBar';
import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
import { VideoView } from 'expo-video';
import React from 'react';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './Player.style';
import { PlayerComponentProps } from './Player.type';
import ThemedPressable from 'Component/ThemedPressable';

export function PlayerComponent(props: PlayerComponentProps) {
  const {
    player,
    status,
    showControls,
    toggleControls,
    togglePlayPause,
    rewindPosition,
    seekToPosition,
  } = props;

  const renderControls = () => {
    const { isPlaying } = status;

    if (!showControls) {
      return null;
    }

    return (
      <View style={styles.controls}>
        <ThemedPressable
          style={styles.playControl}
          onPress={togglePlayPause}
        >
          <ThemedText>{isPlaying ? 'Pause' : 'Play'}</ThemedText>
        </ThemedPressable>
        <PlayerProgressBar
          status={status}
          rewindPosition={rewindPosition}
          seekToPosition={seekToPosition}
        />
      </View>
    );
  };

  return (
    <SafeAreaView>
      <ThemedView style={styles.container}>
        <VideoView
          style={styles.video}
          player={player}
          contentFit="contain"
          nativeControls={false}
          allowsFullscreen={false}
          allowsPictureInPicture={false}
        />
        <ThemedPressable
          style={styles.controlsContainer}
          onPress={toggleControls}
        >
          {renderControls()}
        </ThemedPressable>
      </ThemedView>
    </SafeAreaView>
  );
}

export default PlayerComponent;
