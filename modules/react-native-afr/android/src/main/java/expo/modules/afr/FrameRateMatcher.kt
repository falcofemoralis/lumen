package expo.modules.afr

import kotlin.math.abs
import kotlin.math.roundToInt

/** A display mode reduced to what frame rate matching cares about. */
data class DisplayModeSpec(
  val id: Int,
  val width: Int,
  val height: Int,
  val refreshRate: Float
)

/**
 * What [FrameRateMatcher.match] concluded.
 *
 * The cases where nothing happens are kept apart from each other on purpose: whether a
 * device can do this at all varies wildly, and "the display reports no mode for it" and
 * "the stream never said what it is" are the two answers a user needs to tell apart.
 */
sealed interface FrameRateMatch {
  /** Put the display into this mode. */
  data class Switch(val mode: DisplayModeSpec) : FrameRateMatch

  /** The mode the display is already in carries the content evenly. */
  object AlreadyMatched : FrameRateMatch

  /** The display exposes no mode that divides into the content frame rate. */
  object NoMatch : FrameRateMatch

  /** The player has not reported a frame rate, ex. a stream whose manifest omits it. */
  object UnknownFrameRate : FrameRateMatch
}

/**
 * Picks the display mode that shows every frame of the content for the same length of
 * time.
 *
 * A 23.976fps film on a 60Hz display cannot be shown evenly - 60 is not a whole multiple
 * of 23.976 - so the player has to hold some frames for two refreshes and others for
 * three. That uneven cadence is the judder this is here to remove, and the fix is to put
 * the display into a mode whose refresh rate *is* a whole multiple: 24Hz, 48Hz, 72Hz.
 */
object FrameRateMatcher {
  /**
   * How far a mode may sit from a whole multiple of the content frame rate and still
   * count as a match, as a fraction of that multiple.
   *
   * 0.2% is chosen to cover the one case that matters in practice: 23.976fps content on a
   * display whose only film mode is a true 24.000Hz. That drifts by 0.1%, which repeats a
   * frame roughly every 41 seconds - far better than the ~17% of 3:2 pulldown on 60Hz,
   * and the difference most TVs cannot express any other way.
   */
  private const val MAX_DRIFT = 0.002

  /** Below this a mode counts as an exact multiple, ex. a display with a real 23.976Hz mode. */
  private const val EXACT_DRIFT = 0.0002

  /** Anything outside this is not a frame rate, it is a misreported format. */
  private val SANE_FRAME_RATES = 5f..1000f

  fun match(
    modes: List<DisplayModeSpec>,
    current: DisplayModeSpec,
    contentFrameRate: Float
  ): FrameRateMatch {
    if (contentFrameRate !in SANE_FRAME_RATES) {
      return FrameRateMatch.UnknownFrameRate
    }

    // Switching modes blanks the TV for a second or more while HDMI re-syncs, so it is
    // only worth doing when the mode already in use is not good enough on its own.
    val currentDrift = current.score(contentFrameRate)?.drift

    if (currentDrift != null && currentDrift <= MAX_DRIFT) {
      return FrameRateMatch.AlreadyMatched
    }

    // A mode with a different resolution would relayout the whole app and change what the
    // TV is being fed, which is not what frame rate matching is for.
    val candidates = modes
      .filter { it.width == current.width && it.height == current.height }
      .mapNotNull { it.score(contentFrameRate) }
      .filter { it.drift <= MAX_DRIFT }

    val best = candidates.minWithOrNull(
      // An exact multiple first, then the lowest of them. 24Hz output for 24fps content
      // is what a TV's own film mode keys off, where 48Hz or 72Hz only removes the
      // judder without telling the TV what it is showing.
      compareBy<ScoredMode> { it.drift > EXACT_DRIFT }
        .thenBy { it.multiplier }
        .thenBy { it.mode.id }
    ) ?: return FrameRateMatch.NoMatch

    return FrameRateMatch.Switch(best.mode)
  }

  private data class ScoredMode(
    val mode: DisplayModeSpec,
    val multiplier: Int,
    val drift: Double
  )

  /**
   * How far this mode's refresh rate is from the nearest whole multiple of the content
   * frame rate, relative to that multiple - so the number means the same thing whether
   * the mode shows every frame once or three times.
   */
  private fun DisplayModeSpec.score(contentFrameRate: Float): ScoredMode? {
    val multiplier = (refreshRate / contentFrameRate).roundToInt()

    // a display refreshing slower than the content cannot show all of it
    if (multiplier < 1) {
      return null
    }

    val idealRefreshRate = contentFrameRate * multiplier

    return ScoredMode(
      mode = this,
      multiplier = multiplier,
      drift = abs(refreshRate - idealRefreshRate).toDouble() / idealRefreshRate
    )
  }
}
