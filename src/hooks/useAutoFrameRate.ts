import { useConfigContext } from 'Context/ConfigContext';
import { t } from 'i18n/translate';
import { AfrOutcome, AfrStatus, reactNativeAfr } from 'Modules/react-native-afr';
import {
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import NotificationStore from 'Store/Notification.store';
import { setTimeoutSafe } from 'Util/Misc';

/**
 * How long to wait between asking what came of switching this on.
 *
 * There is nothing to report for a second or two: the frame rate is measured from the
 * frames as they are rendered, which takes about 32 of them, and the display takes a
 * moment more to re-sync once it has been asked for a mode.
 */
const FEEDBACK_INTERVAL_MS = 1500;

/** Long enough to cover a slow start, short enough not to answer a question nobody still has. */
const FEEDBACK_ATTEMPTS = 4;

/** Outcomes that are still on their way to being something else. */
const PENDING_OUTCOMES: AfrOutcome[] = [AfrOutcome.IDLE, AfrOutcome.MEASURING];

/** Refresh rates come back as 59.939998626708984, which is not what anyone wants to read. */
const formatRate = (rate: number) => String(Number(rate.toFixed(2)));

const describeStatus = ({ outcome, appliedRefreshRate, contentFrameRate }: AfrStatus): string => {
  switch (outcome) {
    case AfrOutcome.SWITCHED:
    case AfrOutcome.ALREADY_MATCHED:
      return appliedRefreshRate
        ? t('TV switched to {{rate}} Hz', { rate: formatRate(appliedRefreshRate) })
        : t('Frame rate matching is not available on this device');

    // asked for through the surface, where the display never says whether it obliged
    case AfrOutcome.SURFACE_REQUESTED:
      return contentFrameRate
        ? t('Matching the TV to {{fps}} fps', { fps: formatRate(contentFrameRate) })
        : t('Frame rate matching is not available on this device');

    case AfrOutcome.NO_MATCH:
      return contentFrameRate
        ? t('This TV has no refresh rate that fits {{fps}} fps', { fps: formatRate(contentFrameRate) })
        : t('Frame rate matching is not available on this device');

    // the frames disagreed with each other, i.e. the content has no fixed frame rate
    case AfrOutcome.NO_FRAME_RATE:
      return t('This video has no fixed frame rate');

    // still measuring after several tries, so playback is most likely paused
    case AfrOutcome.MEASURING:
    case AfrOutcome.IDLE:
      return t('Play the video to match its frame rate');

    default:
      return t('Frame rate matching is not available on this device');
  }
};

/**
 * Asks the native side what happened, and keeps asking while the answer is still on its
 * way - the frame rate takes a second or two of playback to measure, and reporting
 * "still measuring" to someone who pressed a button is not an answer.
 */
const scheduleFeedback = (
  timeoutRef: RefObject<number | null>,
  attempt = 0
): void => {
  timeoutRef.current = setTimeoutSafe(() => {
    timeoutRef.current = null;

    const status = reactNativeAfr.getStatus();

    if (!PENDING_OUTCOMES.includes(status.outcome) || attempt >= FEEDBACK_ATTEMPTS - 1) {
      NotificationStore.displayMessage(describeStatus(status));

      return;
    }

    scheduleFeedback(timeoutRef, attempt + 1);
  }, FEEDBACK_INTERVAL_MS);
};

/**
 * Keeps the native side of auto frame rate matching in step with the settings.
 *
 * There is nothing to sync beyond the flag. The frame rate of what is playing is only
 * known to the player, so the whole feature runs natively off react-native-video's plugin
 * API - this only says whether it may.
 *
 * Callers pass both switches folded together: the feature has to be enabled in the
 * settings *and* turned on in the player. Switching the settings one off while a film is
 * playing therefore lands here too, and hands the display mode straight back.
 *
 * Applied on mount as well as on change: the flag lives on the native side, which does
 * not survive a restart, so this is what makes the two agree after one.
 */
export const useAutoFrameRate = (isEnabled: boolean) => {
  useEffect(() => {
    reactNativeAfr.setEnabled(isEnabled);
  }, [isEnabled]);
};

/**
 * The player's own control over frame rate matching.
 *
 * It lives in the player rather than in the settings because it is the one place where
 * the effect is visible - and because whether it does anything depends on the TV, the
 * connection and the stream, none of which are knowable from a settings screen. The
 * choice is still remembered: someone who wants their films at 24Hz wants that every
 * time, not once.
 *
 * Switching it on is answered with what actually happened a couple of seconds later,
 * which on a device that cannot do this at all is the only way to tell it apart from a
 * feature that is quietly broken.
 */
export const useAutoFrameRateAction = () => {
  const { playerAutoFrameRateEnabled, playerAutoFrameRate, setConfig } = useConfigContext();
  const feedbackTimeout = useRef<number | null>(null);

  // the device has to be able to do it *and* the user has to have asked for the feature -
  // the settings switch is what puts the button in the player at all
  const isDeviceSupported = useMemo(() => reactNativeAfr.isSupported(), []);
  const isSupported = isDeviceSupported && playerAutoFrameRateEnabled;

  const clearFeedback = useCallback(() => {
    if (feedbackTimeout.current) {
      clearTimeout(feedbackTimeout.current);
      feedbackTimeout.current = null;
    }
  }, []);

  useEffect(() => clearFeedback, [clearFeedback]);

  const toggle = useCallback(() => {
    const isEnabled = !playerAutoFrameRate;

    setConfig('playerAutoFrameRate', isEnabled);
    clearFeedback();

    if (!isEnabled) {
      NotificationStore.displayMessage(t('Frame rate matching off'));

      return;
    }

    scheduleFeedback(feedbackTimeout);
  }, [playerAutoFrameRate, setConfig, clearFeedback]);

  return {
    isAutoFrameRateSupported: isSupported,
    isAutoFrameRateEnabled: playerAutoFrameRate,
    toggleAutoFrameRate: toggle,
  };
};
