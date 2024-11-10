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
import { FocusedElement, SOURCE } from './Player.config';
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

    console.log(type);
    console.log(focusedElement);
    console.log('---');

    if (type === TVEventType.Select && focusedElement !== FocusedElement.Action) {
      toggleControls();
    }

    // if (type === TVEventType.Up && focusedElement === FocusedElement.TopBorder) {
    //   toggleControls();
    // }
  });

  useEffect(() => {
    const backAction = () => {
      console.log('backAction');

      if (showControls) {
        setFocusedElement(undefined);
        toggleControls();
        return true;
      }

      BackHandler.exitApp();

      return true;
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
    const { isPlaying } = status;

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
        rewindPosition={rewindPosition}
        seekToPosition={seekToPosition}
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
      {/* <TVFocusGuideView style={styles.invisibleContainer}>
        <Pressable
          key={'topBorder'}
          isTVSelectable
          style={{ width: '100%', height: 10 }}
          onFocus={() => {
            setFocusedElement(FocusedElement.TopBorder);
          }}
        />
      </TVFocusGuideView> */}
      {renderControls()}
    </View>
  );
}

export default PlayerComponentTV;
