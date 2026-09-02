import ReactNativeLoudnessModule from './ReactNativeLoudnessModule';

/** How hard the compressor works. */
export enum LoudnessStrength {
  OFF = 'off',
  LIGHT = 'light',
  MEDIUM = 'medium',
  STRONG = 'strong',
}

/** Which implementation is carrying the current session. */
export enum LoudnessImplementation {
  /** Nothing is attached, either because it is off or because attaching failed. */
  NONE = 'none',
  /** Android 9 and up: a real compressor with a limiter after it. */
  DYNAMICS_PROCESSING = 'dynamicsProcessing',
  /** Older devices: a single target gain with the platform's own AGC under it. */
  LOUDNESS_ENHANCER = 'loudnessEnhancer',
}

export interface LoudnessStatus {
  strength: LoudnessStrength;
  /** Whether an effect is on a session right now, i.e. whether something is playing. */
  isAttached: boolean;
  /** The audio session it is on, `0` for none. */
  sessionId: number;
  implementation: LoudnessImplementation;
}

/**
 * Volume normalization: evening out the difference between the loudest and the quietest
 * parts of a film while it plays.
 *
 * Films are mixed for a room that can carry an explosion at the level a cinema plays it,
 * so the dialogue between the explosions sits far below it. On a TV speaker, or with
 * anyone else in the house asleep, that range is unusable - the loud parts are too loud
 * at the volume the quiet parts need. A compressor holds the loud parts back and then
 * lifts everything, which brings the two ends together.
 *
 * Everything here is Android only and driven natively: the compressor is a system audio
 * effect attached to the player's audio session, and that session id never reaches JS -
 * so there is nothing to hand over, only which strength to use.
 *
 * Two things are worth knowing before promising this to anyone:
 *
 * - **Passthrough bypasses it.** A TV box bitstreaming AC3, E-AC3 or DTS to a receiver
 *   decodes nothing itself, so there is no signal here to compress and nothing changes.
 *   The streams this app plays are AAC, which is decoded on the device.
 * - Compression is a matter of taste. {@link LoudnessStrength.STRONG} will sound pumped
 *   on a well mixed film, which is why the level is the user's to pick.
 */
class ReactNativeLoudness {
  /**
   * Whether the device implements either audio effect. False on the cheap TV boxes that
   * ship without any, where the setting is hidden rather than offered and doing nothing.
   */
  isSupported(): boolean {
    return ReactNativeLoudnessModule.isSupported();
  }

  /**
   * Mirrors the user's setting to the native side, where the player plugin reads it.
   *
   * Takes effect within a second, on whatever is playing and on everything that plays
   * afterwards - the effect is attached to the session, not to a film, so switching it
   * mid-playback neither interrupts nor re-buffers anything.
   */
  setStrength(strength: LoudnessStrength): void {
    if (!this.isSupported()) {
      return;
    }

    ReactNativeLoudnessModule.setStrength(strength);
  }

  /** What is attached right now, for diagnostics. */
  getStatus(): LoudnessStatus {
    return ReactNativeLoudnessModule.getStatus();
  }
}

export const reactNativeLoudness = new ReactNativeLoudness();
