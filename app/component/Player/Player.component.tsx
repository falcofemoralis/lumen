import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
import React, { useRef, useState } from 'react';
import { DimensionValue, Pressable, StyleSheet, TVFocusGuideView, View } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import Slider from '@react-native-community/slider';

const videoSource =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

type Status = Partial<AVPlaybackStatus> & {
  isPlaying?: boolean;
  isLoaded?: boolean;
  isBuffering?: boolean;
  didJustFinish?: boolean;
  uri?: string;
  rate?: number;
  positionMillis?: number;
  playableDurationMillis?: number;
  durationMillis?: number;
  error?: string;
  // custom
  progressPercentage?: string; // custom strings with '%' as DimensionValue
  playablePercentage?: string; // set during player status updates
};

export function PlayerComponent() {
  const player = useRef<Video>(null);
  const [showControls, setShowControls] = useState(false);
  const [status, setStatus] = useState<Status>({
    progressPercentage: '0%',
    playablePercentage: '0%',
    durationMillis: 0,
    isPlaying: false,
  });
  const progressThumbRef = useRef(null);

  // Name of currently focussed element. (Passing back to PlayerScreen to determine remote control actions from our progress 'slider')
  const currentFocusNameRef = useRef('');
  // Mostly did this for debugging.
  const _setCurrentFocusName = (name: string) => {
    // console.log('_setCurrentFocusName', name)
    currentFocusNameRef.current = name;
  };

  const onPlaybackStatusUpdate = async (newStatus: Status) => {
    // console.log('newStatus', newStatus)
    if (!newStatus) {
      return;
    }

    if (newStatus?.error) {
      console.log('VIDEO ERROR!', newStatus?.error);
      return;
    }

    if (!player) {
      return;
    }
    // if(newStatus?.isBuffering){
    //     console.log('Buffering')
    // }
    if (newStatus?.isLoaded) {
      // if (newStatus?.didJustFinish) {
      //   await player.stopAsync().catch((err) => {});
      //   await player.setStatusAsync(defaultStatus).catch((err) => {});
      //   status.current = defaultStatus;
      //   setStatus(status.current);
      //   setVideoSource({ uri: null });
      //   // autoplay another video ...

      //   playNextItem();
      // }

      if (
        newStatus.durationMillis &&
        newStatus.positionMillis &&
        newStatus.playableDurationMillis
      ) {
        const progressPercentage =
          (newStatus.positionMillis / newStatus.durationMillis) * 100 + '%';
        const playablePercentage =
          (newStatus.playableDurationMillis / newStatus.durationMillis) * 100 + '%';
        setStatus({ ...newStatus, progressPercentage, playablePercentage });
      }
    }
  };

  return (
    <ThemedView style={styles.contentContainer}>
      <Video
        style={styles.video}
        ref={player}
        source={{ uri: videoSource }}
        shouldPlay={true}
        resizeMode={ResizeMode.CONTAIN}
        onError={(err) => {
          console.log('Video ERROR', err);
        }}
        useNativeControls={false}
        onPlaybackStatusUpdate={onPlaybackStatusUpdate}
      ></Video>
      <Pressable
        style={styles.controls}
        onPress={() => (showControls ? setShowControls(false) : setShowControls(true))}
      >
        {showControls && (
          <View>
            <Pressable
              style={styles.playControl}
              onPress={() =>
                status.isPlaying ? player?.current?.pauseAsync() : player?.current?.playAsync()
              }
            >
              <ThemedText>{status.isPlaying ? 'Pause' : 'Play'}</ThemedText>
            </Pressable>
            <Slider
              style={{ width: 200, height: 40 }}
              minimumValue={0}
              maximumValue={status.durationMillis}
              // value={status.positionMillis}
              minimumTrackTintColor="#FFFFFF"
              maximumTrackTintColor="#000000"
            />
          </View>
        )}
      </Pressable>
    </ThemedView>
  );
}

export default PlayerComponent;

const styles = StyleSheet.create({
  contentContainer: {
    position: 'relative',
    backgroundColor: 'red',
    width: '100%',
    height: 'auto',
  },
  video: {
    width: '100%',
    height: 225,
  },
  controls: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'transparent',
    width: '100%',
    height: 225,
  },
  playControl: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    backgroundColor: 'red',
  },
});
