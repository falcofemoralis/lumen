package expo.modules.loudness

import android.media.audiofx.AudioEffect
import android.media.audiofx.DynamicsProcessing
import android.media.audiofx.LoudnessEnhancer
import android.os.Build
import android.util.Log
import androidx.annotation.RequiresApi

/** Which of the two implementations ended up carrying a session, for the diagnostics. */
enum class LoudnessImplementation(val key: String) {
  NONE("none"),
  DYNAMICS_PROCESSING("dynamicsProcessing"),
  LOUDNESS_ENHANCER("loudnessEnhancer")
}

/**
 * One system audio effect, bound to one playback session.
 *
 * The whole feature is this: Android can insert a compressor into an app's own audio
 * session, and everything the session plays goes through it. Nothing is decoded, copied
 * or re-encoded here - the effect runs in the audio server, downstream of the codec and
 * upstream of the mix, which is why it costs nothing and can be switched mid-playback.
 *
 * Two implementations, because the good one is Android 9 and up:
 *
 * - `DynamicsProcessing` is a real compressor with a limiter after it, i.e. exactly what
 *   was asked for - loud passages held back, quiet ones lifted by the makeup gain.
 * - `LoudnessEnhancer` (everything older) is a single "be this much louder" AGC. It
 *   raises quiet passages and keeps peaks from clipping, which is most of the benefit
 *   without any of the control.
 *
 * Every construction can fail. Effects are optional for a device to implement and plenty
 * of cheap TV boxes ship without them, so a throw here is an ordinary outcome and is
 * reported rather than propagated - the alternative is an app that cannot play video on
 * those devices.
 */
class LoudnessEffect {
  companion object {
    private const val TAG = "Loudness"

    /** Effect priority. 0 is what a normal app asks for; higher is for system components. */
    private const val PRIORITY = 0

    /** One band covering everything, so the cutoff sits above the audible range. */
    private const val FULL_RANGE_CUTOFF_HZ = 20000f

    /** What to assume when the session will not say how many channels it has. */
    private const val FALLBACK_CHANNEL_COUNT = 2
  }

  private var effect: AudioEffect? = null

  /** The session the effect is attached to. 0 is media3's "no session yet", so it is none. */
  var sessionId: Int = 0
    private set

  var strength: LoudnessStrength = LoudnessStrength.OFF
    private set

  var implementation: LoudnessImplementation = LoudnessImplementation.NONE
    private set

  val isAttached: Boolean
    get() = effect != null

  /**
   * What was tried and did not work, so it is not tried again every second.
   *
   * A device that passed `queryEffects` can still refuse to build the effect, and without
   * this that refusal would be a failed construction and a log line once a second for the
   * length of the film.
   */
  private var failedSessionId: Int = 0
  private var failedStrength: LoudnessStrength = LoudnessStrength.OFF

  /**
   * Puts [strength] on [sessionId], replacing whatever was there.
   *
   * Called once a second from the plugin's poll, so the common case - the same strength
   * on the same session - has to be free, and is.
   */
  fun apply(sessionId: Int, strength: LoudnessStrength) {
    if (this.sessionId == sessionId && this.strength == strength) {
      return
    }

    release()

    if (strength == LoudnessStrength.OFF) {
      return
    }

    if (sessionId == failedSessionId && strength == failedStrength) {
      return
    }

    val created = createDynamicsProcessing(sessionId, strength)?.also {
      implementation = LoudnessImplementation.DYNAMICS_PROCESSING
    } ?: createLoudnessEnhancer(sessionId, strength)?.also {
      implementation = LoudnessImplementation.LOUDNESS_ENHANCER
    }

    if (created == null) {
      Log.w(TAG, "No audio effect could be attached to session $sessionId")

      failedSessionId = sessionId
      failedStrength = strength

      return
    }

    effect = created
    this.sessionId = sessionId
    this.strength = strength
    failedSessionId = 0

    Log.d(TAG, "Attached ${implementation.key} at ${strength.key} to session $sessionId")
  }

  /** Takes the effect off the session, leaving the audio the way it would have been. */
  fun release() {
    try {
      effect?.release()
    } catch (e: RuntimeException) {
      Log.d(TAG, "Effect was already gone", e)
    }

    effect = null
    sessionId = 0
    strength = LoudnessStrength.OFF
    implementation = LoudnessImplementation.NONE
  }

  private fun createDynamicsProcessing(sessionId: Int, strength: LoudnessStrength): AudioEffect? {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.P) {
      return null
    }

    return try {
      buildDynamicsProcessing(sessionId, strength)
    } catch (e: RuntimeException) {
      // UnsupportedOperationException on a device without the effect, IllegalStateException
      // on a session that went away between the poll and here, IllegalArgumentException on
      // an implementation that dislikes the config - all of them mean "try the fallback".
      Log.w(TAG, "DynamicsProcessing is not available on this device", e)

      null
    }
  }

  @RequiresApi(Build.VERSION_CODES.P)
  private fun buildDynamicsProcessing(sessionId: Int, strength: LoudnessStrength): AudioEffect {
    val config = DynamicsProcessing.Config.Builder(
      DynamicsProcessing.VARIANT_FAVOR_FREQUENCY_RESOLUTION,
      channelCount(sessionId),
      // Only the compressor and the limiter. The equalisers are what a tone control would
      // use and every stage that is in use costs cycles in the audio server, so the ones
      // this does not touch are declared out of use rather than left flat.
      false, 0,
      true, 1,
      false, 0,
      true
    ).build()

    // One band across the whole spectrum rather than several: a multiband compressor
    // evens out the balance *within* the mix, which is a mastering decision nobody asked
    // for. The ask is that loud scenes and quiet scenes end up closer together, and that
    // is a single band watching the whole signal.
    val band = DynamicsProcessing.MbcBand(
      true,
      FULL_RANGE_CUTOFF_HZ,
      ATTACK_MS,
      RELEASE_MS,
      strength.ratio,
      strength.thresholdDb,
      KNEE_WIDTH_DB,
      NOISE_GATE_THRESHOLD_DB,
      EXPANDER_RATIO,
      0f,
      strength.postGainDb
    )

    val limiter = DynamicsProcessing.Limiter(
      true,
      true,
      // one link group, so a peak in one channel ducks all of them together and the
      // stereo image does not wander during loud scenes
      0,
      LIMITER_ATTACK_MS,
      LIMITER_RELEASE_MS,
      LIMITER_RATIO,
      LIMITER_THRESHOLD_DB,
      0f
    )

    return DynamicsProcessing(PRIORITY, sessionId, config).apply {
      setInputGainAllChannelsTo(0f)
      setMbcBandAllChannelsTo(0, band)
      setLimiterAllChannelsTo(limiter)
      enabled = true
    }
  }

  /**
   * How many channels the session actually carries.
   *
   * Asked rather than assumed because the config has to describe the session it is
   * attached to, and a TV playing a 5.1 track is not the stereo everything else is. The
   * only way to ask is to build a default effect and read it off, which is why this is
   * done once per session rather than once per second.
   */
  @RequiresApi(Build.VERSION_CODES.P)
  private fun channelCount(sessionId: Int): Int {
    val probe = try {
      DynamicsProcessing(sessionId)
    } catch (e: RuntimeException) {
      Log.d(TAG, "Could not probe the channel count", e)

      return FALLBACK_CHANNEL_COUNT
    }

    return try {
      probe.channelCount.takeIf { it > 0 } ?: FALLBACK_CHANNEL_COUNT
    } catch (e: RuntimeException) {
      FALLBACK_CHANNEL_COUNT
    } finally {
      try {
        probe.release()
      } catch (e: RuntimeException) {
        Log.d(TAG, "Probe was already gone", e)
      }
    }
  }

  private fun createLoudnessEnhancer(sessionId: Int, strength: LoudnessStrength): AudioEffect? =
    try {
      LoudnessEnhancer(sessionId).apply {
        setTargetGain(strength.enhancerGainMb)
        enabled = true
      }
    } catch (e: RuntimeException) {
      Log.w(TAG, "LoudnessEnhancer is not available on this device either", e)

      null
    }
}
