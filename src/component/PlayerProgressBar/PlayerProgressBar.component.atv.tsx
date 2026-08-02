import {
  DEFAULT_SMART_SEEKING_PARAMS,
  FocusedElement,
  LONG_PRESS_DURATION,
  RewindDirection,
  SmartSeekingParams,
} from 'Component/Player/Player.config';
import { LongEvent } from 'Component/Player/Player.type';
import { PlayerStoryboard } from 'Component/PlayerStoryboard';
import { ThemedPressable } from 'Component/ThemedPressable';
import { useConfigContext } from 'Context/ConfigContext';
import { usePlayerContext } from 'Context/PlayerContext';
import { usePlayerProgressContext } from 'Context/PlayerProgressContext';
import { useLatest } from 'Hooks/useLatest';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import {
  useCallback,
  useEffect,
  useEffectEvent,
  useRef,
} from 'react';
import { View } from 'react-native';
import { Slider } from 'react-native-awesome-slider';
import { useSharedValue } from 'react-native-reanimated';
import { useAppTheme } from 'Theme/context';
import { noopFn } from 'Util/Function';
import { setTimeoutSafe } from 'Util/Misc';
import RemoteControlManager from 'Util/RemoteControl/RemoteControlManager';
import { SupportedKeys } from 'Util/RemoteControl/SupportedKeys';

import { componentStyles } from './PlayerProgressBar.style.atv';
import { PlayerProgressBarComponentProps } from './PlayerProgressBar.type';

export const PlayerProgressBarComponent = ({
  player,
  storyboardUrl,
  thumbFocusKey,
  hideActions,
  onFocus = noopFn,
  calculateCurrentTime,
  seekToPosition,
  rewindPosition = noopFn,
  togglePlayPause = noopFn,
}: PlayerProgressBarComponentProps) => {
  const { theme } = useAppTheme();
  const styles = useThemedStyles(componentStyles);
  const { focusedElement } = usePlayerContext();
  const { progressStatus, updateProgressStatus } = usePlayerProgressContext();
  const rewindTimer = useRef<number | null>(null);
  const { playerRewindSeconds } = useConfigContext();

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
    const { duration = 0, isPlaying: playing } = player;

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
  }, [player, progressStatus, seekToPosition, togglePlayPause, calculateCurrentTime, updateProgressStatus]);

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
      rewindPosition(direction, playerRewindSeconds);
    }
  }, [toggleSmartSeeking, rewindPosition, playerRewindSeconds]);

  // Read at call time: `progressStatus` ticks constantly, so anything the
  // listeners close over directly would force a re-subscribe on every frame.
  const getFocusedElement = useLatest(focusedElement);
  const onThumbKeyDown = useEffectEvent(
    (key: SupportedKeys, direction: RewindDirection) => handleProgressThumbKeyDown(key, direction)
  );
  const onThumbKeyUp = useEffectEvent(
    (key: SupportedKeys, direction: RewindDirection) => handleProgressThumbKeyUp(key, direction)
  );

  // Remote control event listeners setup
  useEffect(() => {
    const keyDownListener = (type: SupportedKeys) => {
      if (getFocusedElement() !== FocusedElement.PROGRESS_THUMB) {
        return false;
      }

      if (type === SupportedKeys.LEFT) {
        onThumbKeyDown(type, RewindDirection.BACKWARD);

        // Consume the key so it never reaches the norigin layout adapter (the
        // first listener registered, hence the last one to run). Horizontally
        // the thumb only seeks - there is nothing to navigate to - but the
        // action rows are merely dimmed (opacity: 0), so a geometry pass
        // happily moves focus onto an invisible button and the thumb renders
        // unfocused/small.
        return true;
      }

      if (type === SupportedKeys.RIGHT) {
        onThumbKeyDown(type, RewindDirection.FORWARD);

        return true;
      }

      return false;
    };

    const keyUpListener = (type: SupportedKeys) => {
      if (getFocusedElement() !== FocusedElement.PROGRESS_THUMB) {
        return false;
      }

      if (type === SupportedKeys.LEFT) {
        onThumbKeyUp(type, RewindDirection.BACKWARD);
      }

      if (type === SupportedKeys.RIGHT) {
        onThumbKeyUp(type, RewindDirection.FORWARD);
      }

      return false;
    };

    const remoteControlDownListener = RemoteControlManager.addKeydownListener(keyDownListener);
    const remoteControlUpListener = RemoteControlManager.addKeyupListener(keyUpListener);

    return () => {
      RemoteControlManager.removeKeydownListener(remoteControlDownListener);
      RemoteControlManager.removeKeyupListener(remoteControlUpListener);
    };
    // Subscribe once per mount. `RemoteControlManager` dispatches newest
    // listener first, and Player's listener (registered after ours, since
    // parent effects run last) has to see LEFT/RIGHT before we consume it -
    // that is what reveals the seek-only controls layout. Re-subscribing here
    // would flip that order.
  }, [getFocusedElement]);

  // Memoized thumb render to prevent unnecessary re-renders
  const renderThumb = useCallback(() => (
    <ThemedPressable
      focusKey={ thumbFocusKey }
      onFocus={ onFocus }
      autofocus
    >
      { ({ isFocused }) => (
        <View
          style={ [
            styles.thumb,
            isFocused && styles.focusedThumb,
          ] }
        />
      ) }
    </ThemedPressable>
  ), [thumbFocusKey, onFocus, styles]);

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
          minimumTrackTintColor: theme.colors.secondary,
          cacheTrackTintColor: '#F97F87',
          maximumTrackTintColor: '#8B8B8B',
          bubbleBackgroundColor: theme.colors.secondary,
        } }
        renderThumb={ renderThumb }
      />
    </View>
  );
};

export default PlayerProgressBarComponent;
