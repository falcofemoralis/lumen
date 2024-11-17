import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import PlayerProgressBar from 'Component/PlayerProgressBar';
import ThemedTouchableOpacity from 'Component/ThemedTouchableOpacity';
import { VideoView } from 'expo-video';
import React, { useEffect, useState } from 'react';
import { BackHandler, HWEvent, TVFocusGuideView, useTVEventHandler, View } from 'react-native';
import { TVEventType } from 'Type/TVEvent.type';
import { scale } from 'Util/CreateStyles';
import { FocusedElement } from './Player.config';
import { styles } from './Player.style.atv';
import { PlayerComponentProps } from './Player.type';

export function PlayerComponentTV(props: PlayerComponentProps) {
  const {
    player,
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

    console.log(focusedElement);

    if (type === TVEventType.Select && focusedElement !== FocusedElement.Action && showControls) {
      toggleControls();
    }

    if (type === TVEventType.Select && !showControls) {
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
    <ThemedTouchableOpacity
      onFocus={() => setFocusedElement(FocusedElement.Action)}
      onPress={action}
    >
      <MaterialIcons
        // @ts-ignore
        name={icon}
        size={scale(36)}
        color="white"
      />
    </ThemedTouchableOpacity>
  );

  const renderTopActions = () => {
    const { isPlaying } = status;

    // if (!showControls) {
    //   return null;
    // }

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
        focusedElement={focusedElement}
        setFocusedElement={setFocusedElement}
        rewindPosition={rewindPosition}
        seekToPosition={seekToPosition}
        showControls={showControls}
      />
    );
  };

  const renderBottomActions = () => {
    // if (!showControls) {
    //   return null;
    // }

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
      <VideoView
        style={styles.video}
        player={player}
        contentFit="contain"
        nativeControls={false}
        allowsFullscreen={false}
        allowsPictureInPicture={false}
      />
      {renderControls()}
    </View>
  );
}

export default PlayerComponentTV;
