package expo.modules.loudness

/**
 * How hard the compressor works, as the four things the user can pick between.
 *
 * A compressor is described by where it starts working (the threshold) and how much of
 * everything above that it lets through (the ratio). At 4:1 a passage 12 dB over the
 * threshold comes out 3 dB over it, so the loud half of a film is pulled towards the
 * quiet half; the makeup gain then lifts the whole thing back up, which is what makes the
 * quiet half louder. A lower threshold with a higher ratio therefore evens out more, at
 * the cost of sounding progressively less like the mix the film was given.
 *
 * The numbers are dB relative to full scale throughout, i.e. all negative.
 */
enum class LoudnessStrength(
  /** What JS calls this level. */
  val key: String,
  /** Level above which the compressor starts holding the signal back. */
  val thresholdDb: Float,
  /** How much of each dB above the threshold is let through, i.e. `ratio:1`. */
  val ratio: Float,
  /** Makeup gain: what is added back afterwards, and so what lifts quiet passages. */
  val postGainDb: Float,
  /**
   * What the pre-Android 9 fallback is given instead, in millibels.
   *
   * [LoudnessEffect] has no compressor to configure there - `LoudnessEnhancer` takes a
   * single target gain and runs its own AGC under it - so the levels can only be
   * expressed as how much louder they try to be.
   */
  val enhancerGainMb: Int
) {
  OFF("off", 0f, 1f, 0f, 0),
  LIGHT("light", -20f, 2f, 4f, 400),
  MEDIUM("medium", -24f, 4f, 8f, 800),
  STRONG("strong", -30f, 8f, 12f, 1200);

  companion object {
    /** Anything unrecognised is off, so a bad value cannot leave an effect attached. */
    fun from(key: String?): LoudnessStrength =
      values().firstOrNull { it.key == key } ?: OFF
  }
}

/**
 * How quickly the compressor reacts. Fast enough to catch the front of an explosion,
 * slow enough that it does not chew on the syllables of ordinary dialogue - a release
 * measured in tens of milliseconds is what makes compression audible as pumping.
 */
const val ATTACK_MS = 10f
const val RELEASE_MS = 300f

/** Over how many dB around the threshold the ratio fades in, i.e. a soft knee. */
const val KNEE_WIDTH_DB = 6f

/**
 * The band's noise gate and expander, both effectively off: silence between scenes is
 * silence the film intended, and gating it would only add a pumping floor.
 */
const val NOISE_GATE_THRESHOLD_DB = -100f
const val EXPANDER_RATIO = 1f

/**
 * A brick wall just under full scale, so the makeup gain above can never clip.
 *
 * This is the half that makes loud scenes actually quieter rather than merely
 * compressed - without it, a +12 dB makeup on an already loud passage is distortion.
 */
const val LIMITER_THRESHOLD_DB = -1f
const val LIMITER_RATIO = 10f
const val LIMITER_ATTACK_MS = 1f
const val LIMITER_RELEASE_MS = 60f
