import {
  AutoRewindParams,
  DEFAULT_AUTO_REWIND_PARAMS,
  DEFAULT_AUTO_REWIND_SECONDS,
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
import {
  setTimeoutSafe, wait,
} from 'Util/Misc';
import RemoteControlManager from 'Util/RemoteControl/RemoteControlManager';
import { SupportedKeys } from 'Util/RemoteControl/SupportedKeys';

import { styles } from './PlayerProgressBar.style.atv';
import { PlayerProgressBarComponentProps } from './PlayerProgressBar.type';

// eslint-disable-next-line functional/no-let
const autoRewindParams = DEFAULT_AUTO_REWIND_PARAMS as AutoRewindParams;

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
  handleUserInteraction,
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

  useEffect(() => {
    const { progressPercentage, playablePercentage } = progressStatus;

    if (autoRewindParams.active) {
      return;
    }

    setProgress(progressPercentage);
    setPlayable(playablePercentage);
  }, [progressStatus]);

  const rewindPositionAuto = async (
    direction: RewindDirection,
    seconds = DEFAULT_AUTO_REWIND_SECONDS,
  ) => {
    const { duration = 0, playing } = player;

    if (autoRewindParams.active) {
      autoRewindParams.active = false;

      seekToPosition(autoRewindParams.progress);

      if (autoRewindParams.statusBefore !== undefined && autoRewindParams.statusBefore) {
        togglePlayPause();
        autoRewindParams.statusBefore = undefined;
      }

      return;
    }

    (Object.keys(DEFAULT_AUTO_REWIND_PARAMS) as (keyof AutoRewindParams)[]).forEach((key) => {
      autoRewindParams[key] = DEFAULT_AUTO_REWIND_PARAMS[key] as never;
    });

    if (playing) {
      togglePlayPause();
      autoRewindParams.statusBefore = true;
    }

    autoRewindParams.active = true;

    while (autoRewindParams.active) {
      autoRewindParams.count += 1;

      if (autoRewindParams.count % autoRewindParams.factor === 0) {
        autoRewindParams.factor *= 2;
        autoRewindParams.ms /= 2;
      }

      // eslint-disable-next-line no-await-in-loop
      await wait(autoRewindParams.ms);

      if (!autoRewindParams.active) {
        return;
      }

      setProgress((prevProgress) => {
        const seekTime = direction === RewindDirection.Backward ? seconds * -1 : seconds;
        const currentTime = calculateCurrentTime(prevProgress);
        const newTime = currentTime + seekTime;
        const newProgress = (newTime / duration) * 100;

        if (!autoRewindParams.active) {
          return autoRewindParams.progress;
        }

        autoRewindParams.progress = newProgress;

        return newProgress;
      });
    }
  };

  const handleProgressThumbKeyDown = (key: SupportedKeys, direction: RewindDirection) => {
    const e = longEvent.current[key];

    if (!e.isKeyDownPressed) {
      e.isKeyDownPressed = true;
      e.longTimeout = setTimeoutSafe(() => {
        // Long button press
        rewindPositionAuto(direction);
        toggleSeekMode();

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
    <View
      style={ [
        styles.thumb,
        isFocused && styles.focusedThumb,
      ] }
    />
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
