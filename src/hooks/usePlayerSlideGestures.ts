import {
  PlayerSlideControl,
  SLIDE_ACTIVATION_DISTANCE,
  SLIDE_APPLY_STEPS,
  SLIDE_FAIL_DISTANCE,
  SLIDE_INDICATOR_ANIMATION,
  SLIDE_INDICATOR_OFFSET,
  SLIDE_INDICATOR_TIMEOUT,
  SLIDE_RANGE_RATIO,
} from 'Component/Player/Player.config';
import { useConfigContext } from 'Context/ConfigContext';
import * as Brightness from 'expo-brightness';
import { useCallback, useEffect } from 'react';
import { Platform, useWindowDimensions } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import { useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { VolumeManager } from 'react-native-volume-manager';
import { scheduleOnRN } from 'react-native-worklets';
import { noopFn } from 'Util/Function';

/**
 * The player's vertical slide gestures: volume and screen brightness, one on each half
 * of the picture - by default volume on the right, which the settings can swap.
 *
 * With only one of the two switched on there is no half to defend, so it takes the whole
 * width: whoever turned a single gesture on can then use it under either thumb.
 *
 * Both levels live in shared values so that the bar can follow the finger on the UI
 * thread, and so that a slide knows what it is starting from without having to ask the
 * device - neither `getVolume` nor `getBrightnessAsync` can be awaited from a worklet.
 * They are seeded on mount and, for the volume, kept up to date afterwards: the hardware
 * keys still work while the player is open, and the next slide has to carry on from
 * where they left off rather than from where this last looked.
 *
 * Brightness can be seeded from the level the last player was left at instead of from
 * the screen, which is the point of the setting behind it: the override is handed back
 * on the way out, so without somewhere to remember it every film would start at the
 * system brightness and have to be dimmed again.
 *
 * The gesture is built before the effects that seed those values on purpose: writing to
 * a shared value that an effect above has already touched is what react-hooks/immutability
 * is there to catch.
 */
export const usePlayerSlideGestures = (isEnabled: boolean) => {
  const {
    playerVolumeGesture,
    playerBrightnessGesture,
    playerSwapGestureSides,
    playerGestureStep,
    playerSaveBrightness,
    playerSavedBrightness,
    setConfig,
  } = useConfigContext();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const volume = useSharedValue(0);
  const brightness = useSharedValue(0);
  const volumeOpacity = useSharedValue(0);
  const brightnessOpacity = useSharedValue(0);
  const volumeOffset = useSharedValue(SLIDE_INDICATOR_OFFSET);
  const brightnessOffset = useSharedValue(100 - SLIDE_INDICATOR_OFFSET);
  const startValue = useSharedValue(0);
  const appliedStep = useSharedValue(-1);
  const hasSetBrightness = useSharedValue(false);

  // what the finger is on, and by the same token whether there is a finger down at all
  const activeControl = useSharedValue<PlayerSlideControl | null>(null);

  const isVolumeEnabled = isEnabled && playerVolumeGesture;
  const isBrightnessEnabled = isEnabled && playerBrightnessGesture;
  const isSplit = isVolumeEnabled && isBrightnessEnabled;

  const applyValue = useCallback((control: PlayerSlideControl, value: number) => {
    if (control === PlayerSlideControl.VOLUME) {
      VolumeManager.setVolume(value).catch(noopFn);

      return;
    }

    hasSetBrightness.value = true;
    Brightness.setBrightnessAsync(value).catch(noopFn);
  }, []);

  // written when the finger lifts rather than as it moves: a slide crosses dozens of
  // steps, and every one of those would otherwise be a write to storage
  const rememberBrightness = useCallback((value: number) => {
    if (!playerSaveBrightness) {
      return;
    }

    setConfig('playerSavedBrightness', value);
  }, [playerSaveBrightness, setConfig]);

  const slideRange = (screenHeight * SLIDE_RANGE_RATIO) / playerGestureStep;

  const slideGesture = Gesture.Pan()
    .enabled(isVolumeEnabled || isBrightnessEnabled)
    .activeOffsetY([-SLIDE_ACTIVATION_DISTANCE, SLIDE_ACTIVATION_DISTANCE])
    .failOffsetX([-SLIDE_FAIL_DISTANCE, SLIDE_FAIL_DISTANCE])
    .onStart((e) => {
      const isRightSide = e.absoluteX >= screenWidth / 2;

      // only a shared player has a side to read the control off - a lone gesture owns
      // the whole width, and the gesture as a whole is disabled when there is none
      const isVolume = isSplit
        ? isRightSide !== playerSwapGestureSides
        : isVolumeEnabled;

      const opacity = isVolume ? volumeOpacity : brightnessOpacity;
      const offset = isVolume ? volumeOffset : brightnessOffset;

      activeControl.value = isVolume ? PlayerSlideControl.VOLUME : PlayerSlideControl.BRIGHTNESS;
      startValue.value = isVolume ? volume.value : brightness.value;
      appliedStep.value = -1;

      // set while the pill is still invisible, so it is already where it belongs by the
      // time it fades in rather than sliding across the picture to get there
      offset.value = isRightSide ? SLIDE_INDICATOR_OFFSET : 100 - SLIDE_INDICATOR_OFFSET;
      opacity.value = withTiming(1, { duration: SLIDE_INDICATOR_ANIMATION });
    })
    .onUpdate((e) => {
      const control = activeControl.value;

      if (!control) {
        return;
      }

      const value = Math.min(Math.max(startValue.value - (e.translationY / slideRange), 0), 1);

      if (control === PlayerSlideControl.VOLUME) {
        volume.value = value;
      } else {
        brightness.value = value;
      }

      const step = Math.round(value * SLIDE_APPLY_STEPS);

      if (step === appliedStep.value) {
        return;
      }

      appliedStep.value = step;

      scheduleOnRN(applyValue, control, value);
    })
    .onFinalize(() => {
      const control = activeControl.value;

      if (!control) {
        return;
      }

      const isVolume = control === PlayerSlideControl.VOLUME;
      const opacity = isVolume ? volumeOpacity : brightnessOpacity;

      activeControl.value = null;
      opacity.value = withDelay(
        SLIDE_INDICATOR_TIMEOUT,
        withTiming(0, { duration: SLIDE_INDICATOR_ANIMATION })
      );

      if (!isVolume) {
        scheduleOnRN(rememberBrightness, brightness.value);
      }
    });

  // seeding the level the player opens at, which for a remembered one means putting it
  // back on the screen as well. It has to sit below the gesture: a shared value may not
  // be written under a hook that has already closed over it, and the slide writes this
  const restoreBrightness = useCallback((value: number) => {
    brightness.value = value;

    applyValue(PlayerSlideControl.BRIGHTNESS, value);
  }, [applyValue]);

  useEffect(() => {
    if (!playerVolumeGesture) {
      return noopFn;
    }

    // a slide sets the volume dozens of times and every one of those comes back here a
    // moment later, so anything arriving mid-slide is this hook's own echo - following
    // it would drag the bar back to a level the finger has already moved on from
    const readDeviceVolume = ({ volume: value }: { volume: number }) => {
      if (activeControl.value) {
        return;
      }

      volume.value = value;
    };

    VolumeManager.getVolume().then(readDeviceVolume).catch(noopFn);

    const subscription = VolumeManager.addVolumeListener(readDeviceVolume);

    return () => subscription.remove();
  }, [playerVolumeGesture]);

  useEffect(() => {
    if (!playerBrightnessGesture) {
      return noopFn;
    }

    // a remembered level is applied rather than measured. Reading the screen would only
    // ever give back the system brightness the last unmount handed it, which is exactly
    // the level the setting exists to stop the player opening at.
    // `playerSavedBrightness` is deliberately not a dependency: it is written by the
    // slide below, and re-running on it would hand the brightness back mid-film.
    if (playerSaveBrightness && playerSavedBrightness !== undefined) {
      restoreBrightness(playerSavedBrightness);
    } else {
      Brightness.getBrightnessAsync()
        .then((value) => {
          brightness.value = value;
        })
        .catch(noopFn);
    }

    // the override belongs to the activity rather than to this screen, so leaving the
    // player without handing it back would dim the rest of the app along with it
    return () => {
      if (!hasSetBrightness.value || Platform.OS !== 'android') {
        return;
      }

      hasSetBrightness.value = false;
      Brightness.restoreSystemBrightnessAsync().catch(noopFn);
    };
  }, [playerBrightnessGesture, playerSaveBrightness]);

  return {
    slideGesture,
    volumeIndicator: {
      value: volume,
      opacity: volumeOpacity,
      offset: volumeOffset,
    },
    brightnessIndicator: {
      value: brightness,
      opacity: brightnessOpacity,
      offset: brightnessOffset,
    },
    isVolumeGestureEnabled: playerVolumeGesture,
    isBrightnessGestureEnabled: playerBrightnessGesture,
  };
};

export default usePlayerSlideGestures;
