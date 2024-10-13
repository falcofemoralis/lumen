import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
import React, { useRef, useState } from 'react';
import { DimensionValue, Pressable, StyleSheet, TVFocusGuideView, View } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';

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

export function PlayerComponentTV() {
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
            {/* Progress Bar */}
            {
              <TVFocusGuideView
                autoFocus
                destinations={[progressThumbRef.current]}
                style={[
                  {
                    backgroundColor: '#555555aa',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    width: '95%',
                    height: 4,
                    marginTop: 40,
                    marginBottom: 20,
                  },
                ]}
              >
                {status && status.progressPercentage && status.durationMillis && (
                  <>
                    {/* Playable Duration */}
                    {status.playablePercentage && (
                      <View
                        style={[
                          {
                            backgroundColor: '#888888aa',
                            display: 'flex',
                            alignItems: 'center',
                            position: 'absolute',
                            zIndex: 0,
                            top: 0,
                            bottom: 0,
                            left: 0,
                            width: status.playablePercentage as DimensionValue,
                          },
                        ]}
                      ></View>
                    )}

                    {/* Progress Playback */}
                    {status.progressPercentage && (
                      <View
                        style={[
                          {
                            backgroundColor: 'yellow',
                            display: 'flex',
                            alignItems: 'center',
                            position: 'absolute',
                            zIndex: 1,
                            top: 0,
                            bottom: 0,
                            left: 0,
                            width: status.progressPercentage as DimensionValue,
                          },
                        ]}
                      >
                        {/* Progress Thumb */}
                        <Pressable
                          style={[
                            {
                              zIndex: 3,
                              width: 10,
                              height: 10,
                              borderRadius: 99,
                              backgroundColor: 'yellow',
                              position: 'absolute',
                              top: '-80%',
                              right: 0,
                            },
                            currentFocusNameRef === progressThumbRef.current && {
                              backgroundColor: 'yellow',
                            },
                          ]}
                          // hasTVPreferredFocus
                          isTVSelectable={true}
                          key={'progressThumb'}
                          ref={progressThumbRef}
                          onFocus={() => {
                            /*setCurrentFocus(progressThumbRef.current);*/ _setCurrentFocusName(
                            'progressThumb'
                          );
                          }}
                        ></Pressable>
                      </View>
                    )}
                  </>
                )}
              </TVFocusGuideView>
            }
          </View>
        )}
      </Pressable>
    </ThemedView>
  );
}

export default PlayerComponentTV;

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
