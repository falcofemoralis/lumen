import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { VideoView } from 'expo-video';
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
import { scale } from 'Util/CreateStyles';
import RemoteControlManager from 'Util/RemoteControl/RemoteControlManager';
import { SupportedKeys } from 'Util/RemoteControl/SupportedKeys';

import { FocusedElement, RewindDirection } from './Player.config';
import { styles } from './Player.style.atv';
import { PlayerComponentProps } from './Player.type';

export function PlayerComponent({
  player,
  status,
  togglePlayPause,
  rewindPosition,
  rewindPositionAuto,
}: PlayerComponentProps) {
  const [focusedElement, setFocusedElement] = useState<FocusedElement>(
    FocusedElement.ProgressThumb,
  );
  const [showControls, setShowControls] = useState(false);
  const [hideActions, setHideActions] = useState(false);

  const toggleSeekMode = () => {
    setHideActions(true);
    setShowControls(true);
  };

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
          toggleSeekMode();
        }

        if (type === SupportedKeys.Right) {
          rewindPosition(RewindDirection.Forward);
          toggleSeekMode();
        }

        if (type === SupportedKeys.LongLeft) {
          rewindPositionAuto(RewindDirection.Backward);
          toggleSeekMode();
        }

        if (type === SupportedKeys.LongRight) {
          rewindPositionAuto(RewindDirection.Forward);
          toggleSeekMode();
        }

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
        status.isPlaying ? 'pause' : 'play-arrow',
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
          style={ styles.thumbContainer }
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
      <VideoView
        style={ styles.video }
        player={ player }
        contentFit="contain"
        nativeControls={ false }
        allowsFullscreen={ false }
        allowsPictureInPicture={ false }
      />
      { renderControls() }
    </View>
  );
}

export default PlayerComponent;
