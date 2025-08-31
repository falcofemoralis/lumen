import {
  DEFAULT_SMART_SEEKING_PARAMS,
  FocusedElement,
  LONG_PRESS_DURATION,
  REWIND_SECONDS_TV,
  RewindDirection,
  SmartSeekingParams,
} from 'Component/Player/Player.config';
import { LongEvent } from 'Component/Player/Player.type';
import PlayerStoryboard from 'Component/PlayerStoryboard';
import { usePlayerContext } from 'Context/PlayerContext';
import { usePlayerProgressContext } from 'Context/PlayerProgressContext';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { View } from 'react-native';
import { Slider } from 'react-native-awesome-slider';
import { useSharedValue } from 'react-native-reanimated';
import { SpatialNavigationFocusableView } from 'react-tv-space-navigation';
import { Colors } from 'Style/Colors';
import { noopFn } from 'Util/Function';
import { setTimeoutSafe } from 'Util/Misc';
import RemoteControlManager from 'Util/RemoteControl/RemoteControlManager';
import { SupportedKeys } from 'Util/RemoteControl/SupportedKeys';

import { styles } from './PlayerProgressBar.style.atv';
import { PlayerProgressBarComponentProps } from './PlayerProgressBar.type';

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

  // Refs for performance-critical values to avoid re-renders
  const smartSeekingRef = useRef<SmartSeekingParams>({ ...DEFAULT_SMART_SEEKING_PARAMS });

  // Shared values for smooth animations
  const progress = useSharedValue(0);
  const cache = useSharedValue(0);
  const minimumValue = useSharedValue(0);
  const maximumValue = useSharedValue(100);

  // Memoized long event handlers to prevent recreation
  const longEventRef = useRef<{[key: string]: LongEvent}>({
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

  useEffect(() => {
    const { progressPercentage, playablePercentage } = progressStatus;

    if (smartSeekingRef.current.seeking) {
      return;
    }

    progress.value = progressPercentage;
    cache.value = playablePercentage;
  }, [progressStatus]);

  const toggleSmartSeeking = useCallback((direction: RewindDirection) => {
    const { duration = 0, playing } = player;

    if (smartSeekingRef.current.active) {
      smartSeekingRef.current.active = false;

      if (rewindTimer.current) {
        cancelAnimationFrame(rewindTimer.current);
        rewindTimer.current = null;
      }

      seekToPosition(smartSeekingRef.current.percentage);

      setTimeoutSafe(() => {
        smartSeekingRef.current.seeking = false;
        togglePlayPause(!smartSeekingRef.current.statusBefore, false);
      }, 50);

      return;
    }

    togglePlayPause(true, true);

    Object.assign(smartSeekingRef.current, DEFAULT_SMART_SEEKING_PARAMS);

    smartSeekingRef.current.active = true;
    smartSeekingRef.current.percentage = progressStatus.progressPercentage;
    smartSeekingRef.current.seeking = true;
    smartSeekingRef.current.statusBefore = playing;

    let lastUpdateTime = 0;

    const updatePosition = (timestamp: number) => {
      if (!smartSeekingRef.current.active) {
        return;
      }

      const deltaTime = timestamp - lastUpdateTime;

      if (deltaTime >= smartSeekingRef.current.delta) {
        const seconds = direction === RewindDirection.BACKWARD
          ? smartSeekingRef.current.seconds * -1
          : smartSeekingRef.current.seconds;

        const seekTime = Math.exp(smartSeekingRef.current.iterations * smartSeekingRef.current.velocity) * seconds;

        const currentTime = calculateCurrentTime(smartSeekingRef.current.percentage);
        const newTime = currentTime + seekTime;

        if (newTime <= 0 || newTime > duration) {
          smartSeekingRef.current.percentage = 0;
          // eslint-disable-next-line react-compiler/react-compiler
          progress.value = smartSeekingRef.current.percentage;
          updateProgressStatus(newTime <= 0 ? 0 : duration, 0, duration);

          return;
        }

        smartSeekingRef.current.percentage = newTime * 100 / duration;
        smartSeekingRef.current.iterations++;

        progress.value = smartSeekingRef.current.percentage;
        updateProgressStatus(newTime, 0, duration);

        lastUpdateTime = timestamp;
      }

      rewindTimer.current = requestAnimationFrame(updatePosition);
    };

    rewindTimer.current = requestAnimationFrame(updatePosition);
  }, [player, seekToPosition, togglePlayPause, calculateCurrentTime, updateProgressStatus]);

  // Memoized key handlers to prevent recreation
  const handleProgressThumbKeyDown = useCallback((key: SupportedKeys, direction: RewindDirection) => {
    const e = longEventRef.current[key];

    if (!e.isKeyDownPressed) {
      e.isKeyDownPressed = true;
      e.longTimeout = setTimeoutSafe(() => {
        // Long button press
        toggleSmartSeeking(direction);

        e.longTimeout = null;
        e.isLongFired = true;
      }, LONG_PRESS_DURATION);
    }

    return true;
  }, [toggleSmartSeeking]);

  const handleProgressThumbKeyUp = useCallback((key: SupportedKeys, direction: RewindDirection) => {
    const e = longEventRef.current[key];
    e.isKeyDownPressed = false;

    if (e.isLongFired) {
      // Long button unpress
      e.isLongFired = false;
      toggleSmartSeeking(direction);
    }

    if (e.longTimeout) {
      // Button press
      clearTimeout(e.longTimeout);
      rewindPosition(direction, REWIND_SECONDS_TV);
    }
  }, [toggleSmartSeeking, rewindPosition]);

  // Memoized remote control event listeners
  const remoteControlListeners = useMemo(() => {
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

    return { keyDownListener, keyUpListener };
  }, [focusedElement, handleProgressThumbKeyDown, handleProgressThumbKeyUp]);

  // Remote control event listeners setup
  useEffect(() => {
    const { keyDownListener, keyUpListener } = remoteControlListeners;

    const remoteControlDownListener = RemoteControlManager.addKeydownListener(keyDownListener);
    const remoteControlUpListener = RemoteControlManager.addKeyupListener(keyUpListener);

    return () => {
      RemoteControlManager.removeKeydownListener(remoteControlDownListener);
      RemoteControlManager.removeKeyupListener(remoteControlUpListener);
    };
  }, [remoteControlListeners]);

  // Memoized thumb render to prevent unnecessary re-renders
  const renderThumb = useCallback(() => (
    <SpatialNavigationFocusableView
      ref={ thumbRef }
      onFocus={ onFocus }
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
  ), [thumbRef, onFocus]);

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

  return (
    <View style={ styles.progressBarContainer }>
      { renderStoryboard() }
      <Slider
        progress={ progress }
        cache={ cache }
        minimumValue={ minimumValue }
        maximumValue={ maximumValue }
        style={ styles.progressBar }
        theme={ {
          minimumTrackTintColor: Colors.secondary,
          cacheTrackTintColor: '#F97F87',
          maximumTrackTintColor: '#8B8B8B',
          bubbleBackgroundColor: Colors.secondary,
        } }
        renderThumb={ renderThumb }
      />
    </View>
  );
};

export default PlayerProgressBarComponent;
