import ReactNativeAfrModule from './ReactNativeAfrModule';

/** What the last matching attempt did. */
export enum AfrOutcome {
  /** Nothing is playing, or matching is switched off. */
  IDLE = 'idle',
  /** The display was asked for a mode that matches the content. */
  SWITCHED = 'switched',
  /** The display was already in a mode that carries the content evenly. */
  ALREADY_MATCHED = 'alreadyMatched',
  /** No display mode fit, but Android 12+ let the surface ask for the rate directly. */
  SURFACE_REQUESTED = 'surfaceRequested',
  /** The display offers nothing that fits - the usual answer on a device with one mode. */
  NO_MATCH = 'noMatch',
  /** Not enough frames have been timed yet to know what is playing. */
  MEASURING = 'measuring',
  /** The content has no fixed frame rate, so there is nothing to match it to. */
  NO_FRAME_RATE = 'noFrameRate',
  /** The device has no display mode API at all, i.e. below Android 6. */
  UNSUPPORTED = 'unsupported',
}

export interface AfrStatus {
  isEnabled: boolean;
  /**
   * Frame rate of what is playing, `null` until enough frames have been timed.
   *
   * It is measured from the rendered frames rather than read off the stream: a plain MP4
   * URL declares no frame rate, and neither does the master playlist this app builds for
   * automatic quality, so the declared one is almost never there to read.
   */
  contentFrameRate: number | null;
  /** The refresh rate the display was last asked for. */
  appliedRefreshRate: number | null;
  /** The refresh rate the display is in right now. */
  displayRefreshRate: number | null;
  outcome: AfrOutcome;
}

export interface AfrDisplayMode {
  id: number;
  width: number;
  height: number;
  refreshRate: number;
}

/**
 * Auto frame rate: matching the display's refresh rate to the frame rate of what is
 * playing.
 *
 * A 23.976fps film cannot be shown evenly on a 60Hz display - 60 is not a whole multiple
 * of 23.976 - so the player holds some frames for two refreshes and others for three, and
 * that uneven cadence is the judder visible in slow camera pans. Putting the display into
 * a 24Hz (or 48Hz, or 72Hz) mode for the duration removes it.
 *
 * Everything here is Android TV only and driven natively: the frame rate is known to the
 * player and never reaches JS, so there is nothing to hand over - only a switch to turn
 * it on, and {@link getStatus} to find out what came of it.
 *
 * Two things are worth knowing before promising this to anyone:
 *
 * - Switching modes blanks the TV for anywhere between half a second and several seconds
 *   while HDMI re-syncs. It happens once, when the frame rate of a source becomes known.
 * - Plenty of Android TV devices report a single display mode even though their HDMI
 *   output can switch, and there is no way to find that out other than trying. On those
 *   the status comes back as {@link AfrOutcome.NO_MATCH} and nothing else happens.
 */
class ReactNativeAfr {
  /**
   * Whether matching can be attempted, i.e. an Android 6+ TV. True says nothing about
   * whether the display will honour it - only {@link getStatus} can, and only after
   * something has played.
   */
  isSupported(): boolean {
    return ReactNativeAfrModule.isSupported();
  }

  /**
   * Mirrors the user's setting to the native side, where the player plugin reads it.
   *
   * Switching it off while something is playing hands the display mode straight back to
   * the system, which costs the same blank screen as switching to it did.
   */
  setEnabled(isEnabled: boolean): void {
    if (!this.isSupported()) {
      return;
    }

    ReactNativeAfrModule.setEnabled(isEnabled);
  }

  /** What the last attempt did, for diagnostics. */
  getStatus(): AfrStatus {
    return ReactNativeAfrModule.getStatus();
  }

  /**
   * Every mode the display admits to. This is the one thing worth reading before blaming
   * anything else: a device reporting a single mode cannot switch.
   */
  getDisplayModes(): AfrDisplayMode[] {
    return ReactNativeAfrModule.getDisplayModes();
  }
}

export const reactNativeAfr = new ReactNativeAfr();
