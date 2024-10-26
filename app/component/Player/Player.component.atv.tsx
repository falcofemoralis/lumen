import PlayerProgressBar from 'Component/PlayerProgressBar';
import ThemedText from 'Component/ThemedText';
import { ResizeMode, Video } from 'expo-av';
import React, { useEffect, useState } from 'react';
import {
  BackHandler,
  HWEvent,
  Pressable,
  TouchableOpacity,
  TVFocusGuideView,
  useTVEventHandler,
  View,
} from 'react-native';
import { FocusedElement, SOURCE, TVEventType } from './Player.config';
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
    rewindPosition,
    seekToPosition,
  } = props;
  const [focusedElement, setFocusedElement] = useState<string>();

  useTVEventHandler((evt: HWEvent) => {
    const type = evt.eventType;

    if (type === TVEventType.Select && focusedElement !== FocusedElement.Action) {
      toggleControls();
    }

    if (type === TVEventType.Up && focusedElement === FocusedElement.TopBorder) {
      toggleControls();
    }
  });

  useEffect(() => {
    const backAction = () => {
      if (showControls) {
        toggleControls();
        return true;
      }

      BackHandler.exitApp();

      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  });

  const renderAction = (text: string, action: any = () => {}) => (
    <TouchableOpacity
      onFocus={() => setFocusedElement(FocusedElement.Action)}
      onPress={action}
    >
      <ThemedText style={styles.action}>{text}</ThemedText>
    </TouchableOpacity>
  );

  const renderActions = () => {
    return (
      <View style={{ flexDirection: 'row', gap: 4 }}>
        {renderAction('Play', togglePlayPause)}
        {renderAction('Share')}
        {renderAction('Resize')}
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
          rewindPosition={rewindPosition}
          seekToPosition={seekToPosition}
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
            setFocusedElement(FocusedElement.TopBorder);
          }}
        />
      </TVFocusGuideView>
      {renderControls()}
    </TVFocusGuideView>
  );
}

export default PlayerComponentTV;
