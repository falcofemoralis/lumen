import {
  AutoRewindParams,
  DEFAULT_AUTO_REWIND_PARAMS,
  FocusedElement,
  LONG_PRESS_DURATION,
  REWIND_SECONDS_TV,
  RewindDirection,
} from 'Component/Player/Player.config';
import { LongEvent } from 'Component/Player/Player.type';
import PlayerStoryboard from 'Component/PlayerStoryboard';
import { usePlayerContext } from 'Context/PlayerContext';
import { usePlayerProgressContext } from 'Context/PlayerProgressContext';
import React, {
  useEffect,
  useRef,
} from 'react';
import { DimensionValue, View } from 'react-native';
import { SpatialNavigationFocusableView } from 'react-tv-space-navigation';
import { noopFn } from 'Util/Function';
import {
  setTimeoutSafe,
} from 'Util/Misc';
import RemoteControlManager from 'Util/RemoteControl/RemoteControlManager';
import { SupportedKeys } from 'Util/RemoteControl/SupportedKeys';

import { styles } from './PlayerProgressBar.style.atv';
import { PlayerProgressBarComponentProps } from './PlayerProgressBar.type';

const autoRewindParams: AutoRewindParams = {
  ...DEFAULT_AUTO_REWIND_PARAMS,
};

export const PlayerProgressBarComponent = ({
  player,
  storyboardUrl,
  thumbRef,
  hideActions,
  onFocus = noopFn,
  calculateCurrentTime,
  seekToPosition,
  rewindPosition = noopFn,
  togglePlayPause = noopFn,
}: PlayerProgressBarComponentProps) => {
  const { focusedElement } = usePlayerContext();
  const { progressStatus, updateProgressStatus } = usePlayerProgressContext();
  const rewindTimer = useRef<number | null>(null);

  const longEvent = useRef<{[key: string]: LongEvent}>({
    [SupportedKeys.LEFT]: {
      isKeyDownPressed: false,
      longTimeout: null,
      isLongFired: false,
    },
    [SupportedKeys.RIGHT]: {
      isKeyDownPressed: false,
      longTimeout: null,
      isLongFired: false,
    },
  });

  const rewindPositionAuto = (direction: RewindDirection) => {
    const { duration = 0, playing } = player;

    if (autoRewindParams.active) {
      autoRewindParams.active = false;
      if (rewindTimer.current) {
        cancelAnimationFrame(rewindTimer.current);
        rewindTimer.current = null;
      }

      seekToPosition(autoRewindParams.percentage);

      if (autoRewindParams.statusBefore !== undefined && autoRewindParams.statusBefore) {
        togglePlayPause(false);
        autoRewindParams.statusBefore = undefined;
      }

      return;
    }

    Object.assign(autoRewindParams, DEFAULT_AUTO_REWIND_PARAMS);
    togglePlayPause(true);
    autoRewindParams.statusBefore = playing;
    autoRewindParams.active = true;
    autoRewindParams.percentage = progressStatus.progressPercentage;

    let lastUpdateTime = performance.now();
    const updateInterval = 1000 / 16;

    const updatePosition = (timestamp: number) => {
      if (!autoRewindParams.active) return;

      const deltaTime = timestamp - lastUpdateTime;
      if (deltaTime >= updateInterval) {
        const seekTime = direction === RewindDirection.BACKWARD
          ? autoRewindParams.seconds * -1
          : autoRewindParams.seconds;

        const currentTime = calculateCurrentTime(autoRewindParams.percentage);
        const newTime = currentTime + seekTime;

        if (newTime < 0 || newTime > duration) {
          updateProgressStatus(newTime < 0 ? 0 : duration, 0, duration);
          autoRewindParams.active = false;

          return;
        }

        autoRewindParams.percentage = newTime * 100 / duration;
        updateProgressStatus(newTime, 0, duration);

        lastUpdateTime = timestamp;
      }

      rewindTimer.current = requestAnimationFrame(updatePosition);
    };

    rewindTimer.current = requestAnimationFrame(updatePosition);
  };

  const handleProgressThumbKeyDown = (key: SupportedKeys, direction: RewindDirection) => {
    const e = longEvent.current[key];

    if (!e.isKeyDownPressed) {
      e.isKeyDownPressed = true;
      e.longTimeout = setTimeoutSafe(() => {
        // Long button press
        rewindPositionAuto(direction);

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
    }

    if (e.longTimeout) {
      // Button press
      clearTimeout(e.longTimeout);
      rewindPosition(direction, REWIND_SECONDS_TV);
    }
  };

  useEffect(() => {
    const keyDownListener = (type: SupportedKeys) => {
      if (focusedElement === FocusedElement.PROGRESS_THUMB) {
        if (type === SupportedKeys.LEFT) {
          handleProgressThumbKeyDown(type, RewindDirection.BACKWARD);
        }

        if (type === SupportedKeys.RIGHT) {
          handleProgressThumbKeyDown(type, RewindDirection.FORWARD);
        }
      }

      return false;
    };

    const keyUpListener = (type: SupportedKeys) => {
      if (focusedElement === FocusedElement.PROGRESS_THUMB) {
        if (type === SupportedKeys.LEFT) {
          handleProgressThumbKeyUp(type, RewindDirection.BACKWARD);
        }

        if (type === SupportedKeys.RIGHT) {
          handleProgressThumbKeyUp(type, RewindDirection.FORWARD);
        }
      }

      return false;
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

    const currentTime = hideActions ? calculateCurrentTime(
      progressStatus.progressPercentage
    ) : 0;

    return (
      <PlayerStoryboard
        style={ [styles.storyBoard, hideActions && styles.storyBoardVisible] }
        storyboardUrl={ storyboardUrl }
        currentTime={ currentTime }
        scale={ 1.5 }
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
            { width: (`${progressStatus.playablePercentage}%`) as DimensionValue },
          ] }
        />
        { /* Progress Playback */ }
        <View
          style={ [
            styles.progressBar,
            { width: (`${progressStatus.progressPercentage}%`) as DimensionValue },
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
