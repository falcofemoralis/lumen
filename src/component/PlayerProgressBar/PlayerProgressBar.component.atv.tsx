import {
  DEFAULT_AUTO_REWIND_COUNT,
  DEFAULT_AUTO_REWIND_MS,
  DEFAULT_REWIND_SECONDS,
  FocusedElement,
  LONG_PRESS_DURATION,
  RewindDirection,
} from 'Component/Player/Player.config';
import PlayerStore from 'Component/Player/Player.store';
import { LongEvent } from 'Component/Player/Player.type';
import PlayerStoryboard from 'Component/PlayerStoryboard';
import React, {
  useEffect,
  useRef,
  useState,
} from 'react';
import { DimensionValue, View } from 'react-native';
import { SpatialNavigationFocusableView } from 'react-tv-space-navigation';
import { noopFn } from 'Util/Function';
import { setTimeoutSafe } from 'Util/Misc';
import RemoteControlManager from 'Util/RemoteControl/RemoteControlManager';
import { SupportedKeys } from 'Util/RemoteControl/SupportedKeys';

import { styles } from './PlayerProgressBar.style.atv';
import { PlayerProgressBarComponentProps } from './PlayerProgressBar.type';

export const PlayerProgressBarComponent = ({
  player,
  progressStatus,
  storyboardUrl,
  thumbRef,
  hideActions,
  onFocus = noopFn,
  calculateCurrentTime,
  seekToPosition,
  toggleSeekMode = noopFn,
  rewindPosition = noopFn,
  handleUserInteraction = noopFn,
  togglePlayPause = noopFn,
}: PlayerProgressBarComponentProps) => {
  const [progress, setProgress] = useState(progressStatus.progressPercentage || 0);
  const [playable, setPlayable] = useState(progressStatus.playablePercentage || 0);
  const longEvent = useRef<{[key: string]: LongEvent}>({
    [SupportedKeys.Left]: {
      isKeyDownPressed: false,
      longTimeout: null,
      isLongFired: false,
    },
    [SupportedKeys.Right]: {
      isKeyDownPressed: false,
      longTimeout: null,
      isLongFired: false,
    },
  });
  const autoRewindTimeout = useRef<NodeJS.Timeout | null>(null);
  const autoRewindCount = useRef<number>(0);
  const autoRewindFactor = useRef<number>(1);
  const isSliding = useRef<boolean>(false);
  const autoRewindIsPlayed = useRef<boolean>(false);

  useEffect(() => {
    const { progressPercentage, playablePercentage } = progressStatus;

    if (isSliding.current) {
      return;
    }

    setProgress(progressPercentage);
    setPlayable(playablePercentage);
  }, [progressStatus]);

  const calculateSeekProgress = (
    direction: RewindDirection,
    seconds: number = DEFAULT_REWIND_SECONDS,
  ) => {
    const { duration = 0 } = player;

    const newSeconds = seconds * autoRewindFactor.current;
    const seekTime = direction === RewindDirection.Backward ? newSeconds * -1 : newSeconds;
    const currentTime = calculateCurrentTime(progress);
    const newTime = currentTime + seekTime;

    return (newTime / duration) * 100;
  };

  const rewindPositionAuto = (
    direction: RewindDirection,
    seconds = DEFAULT_REWIND_SECONDS,
  ) => {
    if (autoRewindTimeout.current) {
      clearInterval(autoRewindTimeout.current);
      autoRewindTimeout.current = null;
      autoRewindCount.current = 0;
      autoRewindFactor.current = 1;
      isSliding.current = false;

      return;
    }

    isSliding.current = true;
    autoRewindTimeout.current = setInterval(() => {
      autoRewindCount.current += 1;

      if (autoRewindCount.current >= DEFAULT_AUTO_REWIND_COUNT) {
        autoRewindCount.current = 0;
        autoRewindFactor.current += 1;
      }

      setProgress(calculateSeekProgress(direction, seconds * autoRewindFactor.current));
      // vvv change ms to lowers
    }, DEFAULT_AUTO_REWIND_MS);
  };

  const handleProgressThumbKeyDown = (key: SupportedKeys, direction: RewindDirection) => {
    const e = longEvent.current[key];

    if (!e.isKeyDownPressed) {
      e.isKeyDownPressed = true;
      e.longTimeout = setTimeoutSafe(() => {
        // Long button press
        rewindPositionAuto(direction, 30);
        toggleSeekMode();

        if (player.playing) {
          togglePlayPause();
          autoRewindIsPlayed.current = true;
        }

        e.longTimeout = null;
        e.isLongFired = true;
      }, LONG_PRESS_DURATION);
    }

    return true;
  };

  const handleProgressThumbKeyUp = (key: SupportedKeys, direction: RewindDirection) => {
    const e = longEvent.current[key];
    e.isKeyDownPressed = false;

    if (e.isLongFired) {
      // Long button unpress
      e.isLongFired = false;
      rewindPositionAuto(direction);
      toggleSeekMode();
      seekToPosition(progress);

      if (autoRewindIsPlayed.current) {
        togglePlayPause();
        autoRewindIsPlayed.current = false;
      }
    }

    if (e.longTimeout) {
      // Button press
      clearTimeout(e.longTimeout);
      rewindPosition(direction);
      toggleSeekMode();
    }
  };

  useEffect(() => {
    const keyDownListener = (type: SupportedKeys) => {
      if (PlayerStore.focusedElement === FocusedElement.ProgressThumb) {
        if (type === SupportedKeys.Left) {
          handleProgressThumbKeyDown(type, RewindDirection.Backward);
        }

        if (type === SupportedKeys.Right) {
          handleProgressThumbKeyDown(type, RewindDirection.Forward);
        }
      }

      return false;
    };

    const keyUpListener = (type: SupportedKeys) => {
      if (PlayerStore.focusedElement === FocusedElement.ProgressThumb) {
        if (type === SupportedKeys.Left) {
          handleProgressThumbKeyUp(type, RewindDirection.Backward);
        }

        if (type === SupportedKeys.Right) {
          handleProgressThumbKeyUp(type, RewindDirection.Forward);
        }

        handleUserInteraction();
      }

      return true;
    };

    const remoteControlDownListener = RemoteControlManager.addKeydownListener(keyDownListener);
    const remoteControlUpListener = RemoteControlManager.addKeyupListener(keyUpListener);

    return () => {
      RemoteControlManager.removeKeydownListener(remoteControlDownListener);
      RemoteControlManager.removeKeyupListener(remoteControlUpListener);
    };
  });

  const renderStoryboard = () => {
    if (!storyboardUrl) {
      return null;
    }

    const currentTime = hideActions ? calculateCurrentTime(progress) : 0;

    return (
      <PlayerStoryboard
        style={ [styles.storyBoard, hideActions && styles.storyBoardVisible] }
        storyboardUrl={ storyboardUrl }
        currentTime={ currentTime }
      />
    );
  };

  const renderThumb = (isFocused: boolean) => (
    <View>
      <View
        style={ [
          styles.thumb,
          isFocused && styles.focusedThumb,
        ] }
      />
    </View>
  );

  return (
    <View>
      { renderStoryboard() }
      <View style={ styles.progressBarContainer }>
        { /* Playable Duration */ }
        <View
          style={ [
            styles.playableBar,
            { width: (`${playable}%`) as DimensionValue },
          ] }
        />
        { /* Progress Playback */ }
        <View
          style={ [
            styles.progressBar,
            { width: (`${progress}%`) as DimensionValue },
          ] }
        >
          { /* Progress Thumb */ }
          <SpatialNavigationFocusableView
            ref={ thumbRef }
            style={ styles.thumbContainer }
            onFocus={ onFocus }
          >
            { ({ isFocused }) => renderThumb(isFocused) }
          </SpatialNavigationFocusableView>
        </View>
      </View>
    </View>
  );
};

export default PlayerProgressBarComponent;
