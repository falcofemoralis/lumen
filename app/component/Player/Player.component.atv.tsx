import PlayerProgressBar from 'Component/PlayerProgressBar';
import ThemedText from 'Component/ThemedText';
import { ResizeMode, Video } from 'expo-av';
import React, { useState } from 'react';
import {
  HWEvent,
  Pressable,
  TouchableOpacity,
  TVFocusGuideView,
  useTVEventHandler,
  View,
} from 'react-native';
import { SOURCE } from './Player.config';
import { styles } from './Player.style.atv';
import { PlayerComponentProps } from './Player.type';

export function PlayerComponentTV(props: PlayerComponentProps) {
  const {
    onPlaybackStatusUpdate,
    playerRef,
    status,
    showControls,
    toggleControls,
    togglePlayPause,
  } = props;
  const [focusedElement, setFocusedElement] = useState<string>();

  useTVEventHandler((evt: HWEvent) => {
    const type = evt.eventType;
    console.log(type);

    if (type === 'select') {
      toggleControls();
    }
  });

  const renderActions = () => {
    return (
      <View style={{ flexDirection: 'row', gap: 4 }}>
        <TouchableOpacity onPress={togglePlayPause}>
          <ThemedText>Play</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity>
          <ThemedText>Share</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity>
          <ThemedText>Resize</ThemedText>
        </TouchableOpacity>
      </View>
    );
  };

  const renderControls = () => {
    if (!showControls) {
      return null;
    }

    return (
      <View style={styles.controls}>
        <PlayerProgressBar
          status={status}
          playerRef={playerRef}
          focusedElement={focusedElement}
          setFocusedElement={setFocusedElement}
        />
        {renderActions()}
      </View>
    );
  };

  return (
    <TVFocusGuideView style={styles.container}>
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
      {/* Invisible TVFocusGuideView to trick the open/close logic */}
      <TVFocusGuideView
        style={{ height: 16, position: 'absolute', top: -10, left: 10, right: 10, zIndex: 5 }}
      >
        <Pressable
          key={'topBorder'}
          isTVSelectable={true}
          style={{ width: '100%', height: 10 }}
          onFocus={() => {
            setFocusedElement('topBorder');
          }}
        />
      </TVFocusGuideView>
      {renderControls()}
    </TVFocusGuideView>
  );
}

export default PlayerComponentTV;
