import {
  AutoRewindParams,
  DEFAULT_AUTO_REWIND_MIN_MS,
  DEFAULT_AUTO_REWIND_MULTIPLIER,
  DEFAULT_AUTO_REWIND_PARAMS,
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
const autoRewindParams: AutoRewindParams = {
  ...DEFAULT_AUTO_REWIND_PARAMS,
};

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

  const rewindPositionAuto = async (direction: RewindDirection) => {
    const { duration = 0, playing } = player;

    if (autoRewindParams.active) {
      autoRewindParams.active = false;

      seekToPosition(PlayerStore.progressStatus.progressPercentage);

      if (autoRewindParams.statusBefore !== undefined && autoRewindParams.statusBefore) {
        togglePlayPause(false);
        autoRewindParams.statusBefore = undefined;
      }

      return;
    }

    (Object.keys(DEFAULT_AUTO_REWIND_PARAMS) as (keyof AutoRewindParams)[]).forEach((key) => {
      autoRewindParams[key] = DEFAULT_AUTO_REWIND_PARAMS[key] as never;
    });

    togglePlayPause(true);
    autoRewindParams.statusBefore = playing;
    autoRewindParams.active = true;

    while (autoRewindParams.active) {
      // autoRewindParams.count += 1;

      // if (autoRewindParams.count % autoRewindParams.factor === 0) {
      //   autoRewindParams.factor *= DEFAULT_AUTO_REWIND_MULTIPLIER;
      //   autoRewindParams.ms /= DEFAULT_AUTO_REWIND_MULTIPLIER;

      //   // if ms is less than DEFAULT_AUTO_REWIND_MIN_MS ms then mobx update will throw an error
      //   if (autoRewindParams.ms <= DEFAULT_AUTO_REWIND_MIN_MS) {
      //     autoRewindParams.ms = DEFAULT_AUTO_REWIND_MIN_MS;
      //   }

      //   // autoRewindParams.seconds += DEFAULT_AUTO_REWIND_SECONDS;
      // }

      // eslint-disable-next-line no-await-in-loop
      await wait(autoRewindParams.ms);

      if (!autoRewindParams.active) {
        return;
      }

      const seekTime = direction === RewindDirection.BACKWARD
        ? autoRewindParams.seconds * -1
        : autoRewindParams.seconds;
      const currentTime = calculateCurrentTime(PlayerStore.progressStatus.progressPercentage);
      const newTime = currentTime + seekTime;

      if (newTime < 0 || newTime > duration) {
        PlayerStore.setProgressStatus(newTime < 0 ? 0 : duration, 0, duration);

        return;
      }

      PlayerStore.setProgressStatus(
        newTime,
        0,
        duration,
      );
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
      if (PlayerStore.focusedElement === FocusedElement.PROGRESS_THUMB) {
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
      if (PlayerStore.focusedElement === FocusedElement.PROGRESS_THUMB) {
        if (type === SupportedKeys.LEFT) {
          handleProgressThumbKeyUp(type, RewindDirection.BACKWARD);
        }

        if (type === SupportedKeys.RIGHT) {
          handleProgressThumbKeyUp(type, RewindDirection.FORWARD);
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

    const currentTime = hideActions ? calculateCurrentTime(
      PlayerStore.progressStatus.progressPercentage,
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
