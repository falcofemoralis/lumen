import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ResizeMode, Video } from 'expo-av';
import React, { useEffect, useState } from 'react';
import {
  BackHandler,
  DimensionValue,
  View,
} from 'react-native';
import {
  DefaultFocus,
  SpatialNavigationFocusableView,
  SpatialNavigationView,
} from 'react-tv-space-navigation';
import NotificationStore from 'Store/Notification.store';
import { scale } from 'Util/CreateStyles';
import RemoteControlManager from 'Util/RemoteControl/RemoteControlManager';
import { SupportedKeys } from 'Util/RemoteControl/SupportedKeys';

import { FocusedElement, RewindDirection } from './Player.config';
import { styles } from './Player.style.atv';
import { PlayerComponentProps } from './Player.type';

export function PlayerComponent({
  uri,
  playerRef,
  status,
  isPlaying,
  onPlaybackStatusUpdate,
  togglePlayPause,
  rewindPosition,
}: PlayerComponentProps) {
  const [focusedElement, setFocusedElement] = useState<FocusedElement>(
    FocusedElement.ProgressThumb,
  );
  const [showControls, setShowControls] = useState(false);
  const [hideActions, setHideActions] = useState(false);

  useEffect(() => {
    const keyListener = (type: SupportedKeys) => {
      if (type === SupportedKeys.Enter && !showControls) {
        setShowControls(true);

        return true;
      }

      if (focusedElement === FocusedElement.ProgressThumb) {
        if (type === SupportedKeys.Enter) {
          togglePlayPause();
        }

        if (type === SupportedKeys.Left) {
          rewindPosition(RewindDirection.Backward);
          setHideActions(true);
        }

        if (type === SupportedKeys.Right) {
          rewindPosition(RewindDirection.Forward);
          setHideActions(true);
        }

        // if (type === Directions.LongLeft) {
        //   rewindPositionAuto(RewindDirection.Backward);
        // }

        // if (type === TVEventType.LongRight) {
        //   rewindPositionAuto(RewindDirection.Forward);
        // }

        if ((type === SupportedKeys.Up || type === SupportedKeys.Down) && hideActions) {
          setHideActions(false);
        }
      }

      return false;
    };

    const backAction = () => {
      if (showControls) {
        setShowControls(false);
        setHideActions(false);
        setFocusedElement(FocusedElement.ProgressThumb);

        return true;
      }

      return false;
    };

    const remoteControlListener = RemoteControlManager.addKeydownListener(keyListener);

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => {
      backHandler.remove();
      RemoteControlManager.removeKeydownListener(remoteControlListener);
    };
  });

  const renderAction = (
    icon: string,
    _name: string,
    action?: () => void,
  ) => (
    <SpatialNavigationFocusableView
      onSelect={ action }
      onFocus={ () => setFocusedElement(FocusedElement.Action) }
    >
      { ({ isFocused }) => (
        <MaterialIcons
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment -- This is okay
          // @ts-ignore -- It was handled in the code above
          name={ icon }
          size={ scale(36) }
          color={ isFocused ? 'black' : 'white' }
        />
      ) }
    </SpatialNavigationFocusableView>
  );

  const renderTopActions = () => (
    <SpatialNavigationView
      direction="horizontal"
      style={ {
        ...styles.controlsRow,
        ...(hideActions ? styles.controlsRowHidden : {}),
      } }
    >
      { renderAction(
        isPlaying ? 'pause' : 'play-arrow',
        'Play',
        togglePlayPause,
      ) }
      { renderAction('skip-previous', 'Previous') }
      { renderAction('skip-next', 'Next') }
      { renderAction('speed', 'Speed') }
      { renderAction('comment', 'Comments') }
    </SpatialNavigationView>
  );

  const renderProgressBar = () => (
    <View style={ styles.progressBarContainer }>
      <SpatialNavigationView direction="horizontal">
        { /* Playable Duration */ }
        <View
          style={ [
            styles.playableBar,
            { width: (`${status.playablePercentage}%`) as DimensionValue },
          ] }
        />
        { /* Progress Playback */ }
        <View
          style={ [
            styles.progressBar,
            { width: (`${status.progressPercentage}%`) as DimensionValue },
          ] }
        >
          { /* Progress Thumb */ }
          <SpatialNavigationFocusableView
            onFocus={ () => setFocusedElement(FocusedElement.ProgressThumb) }
          >
            { ({ isFocused }) => (
              <View
                style={ [
                  styles.thumb,
                  isFocused && styles.focusedThumb,
                ] }
              />
            ) }
          </SpatialNavigationFocusableView>
        </View>
      </SpatialNavigationView>
    </View>
  );

  const renderBottomActions = () => (
    <SpatialNavigationView
      direction="horizontal"
      style={ {
        ...styles.controlsRow,
        ...(hideActions ? styles.controlsRowHidden : {}),
      } }
    >
      { renderAction('high-quality', 'Quality') }
      { renderAction('playlist-play', 'Series') }
      { renderAction('subtitles', 'Subtitles') }
      { renderAction('bookmarks', 'Bookmarks') }
      { renderAction('share', 'Share') }
    </SpatialNavigationView>
  );

  const renderControls = () => {
    if (!showControls) {
      return null;
    }

    return (
      <View style={ styles.controls }>
        { renderTopActions() }
        <DefaultFocus>
          { renderProgressBar() }
        </DefaultFocus>
        { renderBottomActions() }
      </View>
    );
  };

  return (
    <View style={ styles.container }>
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
      { renderControls() }
    </View>
  );
}

export default PlayerComponent;
