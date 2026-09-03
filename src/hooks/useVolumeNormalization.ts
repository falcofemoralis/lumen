import { DEFAULT_VOLUME_NORMALIZATION_STRENGTH } from 'Component/Player/Player.config';
import { useConfigContext } from 'Context/ConfigContext';
import { t } from 'i18n/translate';
import { LoudnessStrength, reactNativeLoudness } from 'Modules/react-native-loudness';
import { useCallback, useEffect, useMemo } from 'react';
import NotificationStore from 'Store/Notification.store';

const STRENGTHS = Object.values(LoudnessStrength) as string[];

const getStrength = (strength: string): LoudnessStrength => (
  STRENGTHS.includes(strength)
    ? strength as LoudnessStrength
    : DEFAULT_VOLUME_NORMALIZATION_STRENGTH as LoudnessStrength
);

/**
 * Keeps the native side of volume normalization in step with the settings.
 *
 * There is nothing to sync beyond the level. The compressor is a system audio effect
 * attached to the player's audio session, which only the native side can see, so the
 * whole feature runs off react-native-video's plugin API - this only says how hard it
 * should work, or that it should not.
 *
 * Callers pass both switches folded together: the feature has to be enabled in the
 * settings *and* turned on in the player. Switching the settings one off while a film is
 * playing therefore lands here too, and takes the effect straight off the session.
 *
 * Applied on mount as well as on change, and app-wide rather than in the player: the
 * level lives on the native side, which does not survive a restart, and the player that
 * has to pick it up may not be the one open when the setting was changed.
 */
export const useVolumeNormalization = (isEnabled: boolean, strength: string) => {
  useEffect(() => {
    reactNativeLoudness.setStrength(isEnabled ? getStrength(strength) : LoudnessStrength.OFF);
  }, [isEnabled, strength]);
};

/**
 * The player's own control over volume normalization.
 *
 * It lives in the player as well as in the settings because that is where the effect is
 * audible, and because whether it is wanted is a property of the moment rather than of
 * the device - the same person wants it at night and does not want it on a Sunday
 * afternoon. The choice is still remembered: turning it on for one film is almost always
 * a statement about how this person watches films.
 *
 * Unlike frame rate matching there is nothing to report back a couple of seconds later.
 * The effect either attaches to the session or the device has none, which
 * {@link reactNativeLoudness.isSupported} already answered before the button was drawn.
 */
export const useVolumeNormalizationAction = () => {
  const {
    playerVolumeNormalizationEnabled,
    playerVolumeNormalization,
    setConfig,
  } = useConfigContext();

  // the device has to be able to do it *and* the user has to have asked for the feature -
  // the settings switch is what puts the button in the player at all
  const isDeviceSupported = useMemo(() => reactNativeLoudness.isSupported(), []);
  const isSupported = isDeviceSupported && playerVolumeNormalizationEnabled;

  const toggle = useCallback(() => {
    const isEnabled = !playerVolumeNormalization;

    setConfig('playerVolumeNormalization', isEnabled);

    NotificationStore.displayMessage(
      isEnabled ? t('Volume normalization on') : t('Volume normalization off')
    );
  }, [playerVolumeNormalization, setConfig]);

  return {
    isVolumeNormalizationSupported: isSupported,
    isVolumeNormalizationEnabled: playerVolumeNormalization,
    toggleVolumeNormalization: toggle,
  };
};
