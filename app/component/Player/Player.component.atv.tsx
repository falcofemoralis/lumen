import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import PlayerProgressBar from 'Component/PlayerProgressBar';
import { ResizeMode, Video } from 'expo-av';
import React, { useEffect, useState } from 'react';
import {
  BackHandler,
  HWEvent,
  TouchableOpacity,
  TVFocusGuideView,
  useTVEventHandler,
  View,
} from 'react-native';
import { TVEventType } from 'Type/TVEvent.type';
import { scale } from 'Util/CreateStyles';
import { FocusedElement } from './Player.config';
import { styles } from './Player.style.atv';
import { PlayerComponentProps } from './Player.type';
import NotificationStore from 'Store/Notification.store';

export function PlayerComponentTV(props: PlayerComponentProps) {
  const {
    uri,
    playerRef,
    status,
    isPlaying,
    showControls,
    onPlaybackStatusUpdate,
    toggleControls,
    togglePlayPause,
    seekToPosition,
    rewindPosition,
    rewindPositionAuto,
  } = props;
  const [focusedElement, setFocusedElement] = useState<string>();

  useTVEventHandler((evt: HWEvent) => {
    const type = evt.eventType;

    if (type === TVEventType.Select && focusedElement !== FocusedElement.Action) {
      toggleControls();
    }
  });

  useEffect(() => {
    const backAction = () => {
      if (showControls) {
        setFocusedElement(undefined);
        toggleControls();
        return true;
      }

      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  });

  const renderAction = (icon: string, _name: string, action: any = () => {}) => (
    <TouchableOpacity
      onFocus={() => setFocusedElement(FocusedElement.Action)}
      onPress={action}
    >
      <MaterialIcons
        // @ts-ignore
        name={icon}
        size={scale(36)}
        color="white"
      />
    </TouchableOpacity>
  );

  const renderTopActions = () => {
    if (!showControls) {
      return null;
    }

    return (
      <TVFocusGuideView
        style={styles.controlsRow}
        autoFocus
        focusable={showControls}
      >
        {renderAction(isPlaying ? 'pause' : 'play-arrow', 'Play', togglePlayPause)}
        {renderAction('skip-previous', 'Previous')}
        {renderAction('skip-next', 'Next')}
        {renderAction('speed', 'Speed')}
        {renderAction('comment', 'Comments')}
      </TVFocusGuideView>
    );
  };

  const renderProgressBar = () => {
    return (
      <PlayerProgressBar
        status={status}
        playerRef={playerRef}
        focusedElement={focusedElement}
        setFocusedElement={setFocusedElement}
        seekToPosition={seekToPosition}
        rewindPosition={rewindPosition}
        rewindPositionAuto={rewindPositionAuto}
      />
    );
  };

  const renderBottomActions = () => {
    if (!showControls) {
      return null;
    }

    return (
      <TVFocusGuideView
        style={styles.controlsRow}
        autoFocus
        focusable={showControls}
      >
        {renderAction('high-quality', 'Quality')}
        {renderAction('playlist-play', 'Series')}
        {renderAction('subtitles', 'Subtitles')}
        {renderAction('bookmarks', 'Bookmarks')}
        {renderAction('share', 'Share')}
      </TVFocusGuideView>
    );
  };

  const renderControls = () => {
    return (
      <View style={[styles.controls, showControls ? styles.controlsVisible : undefined]}>
        {renderTopActions()}
        {renderProgressBar()}
        {renderBottomActions()}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Video
        style={styles.video}
        ref={playerRef}
        source={{ uri }}
        shouldPlay={true}
        resizeMode={ResizeMode.CONTAIN}
        onError={(err) => {
          NotificationStore.displayError(err);
        }}
        useNativeControls={false}
        onPlaybackStatusUpdate={onPlaybackStatusUpdate}
        progressUpdateIntervalMillis={1000}
      />
      {renderControls()}
    </View>
  );
}

export default PlayerComponentTV;
