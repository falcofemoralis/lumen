package expo.modules.afr

import androidx.media3.common.C
import androidx.media3.common.util.UnstableApi
import kotlin.math.abs

/**
 * Works out the frame rate of what is playing by timing the frames as they are rendered.
 *
 * This is here because `Format.frameRate` is only filled in when the *manifest* declares
 * it - a DASH `@frameRate`, an HLS `FRAME-RATE` attribute - and neither a plain MP4 URL
 * nor the master playlist this app synthesises for automatic quality carries one, so on
 * this app's sources the field is almost always unset. media3 has exactly the same problem
 * and solves it the same way internally (`FixedFrameRateEstimator`), but that estimate
 * lives inside the renderer and is not reachable from outside it.
 *
 * Frames arrive on the playback thread, so the estimate is computed there and published
 * through a volatile for the main thread to read. Nothing here is reset in place - a new
 * source gets a new instance, so a stale window can never be mistaken for a fresh one.
 */
@UnstableApi
class FrameRateEstimator {
  companion object {
    /** ~1.3s of 24fps content: long enough to be certain, short enough to answer quickly. */
    private const val WINDOW = 32

    /** Re-estimating on every frame would sort the window 60 times a second for nothing. */
    private const val ESTIMATE_EVERY = 8

    /** How far an interval may sit from the median and still count as the same rate. */
    private const val MAX_DEVIATION = 0.05

    /** Below this share of agreeing intervals the content has no fixed frame rate. */
    private const val MIN_AGREEMENT = 0.9

    /** Sane frame intervals, i.e. 1000fps down to 5fps. Anything else is a seek or a gap. */
    private const val MIN_INTERVAL_US = 1_000L
    private const val MAX_INTERVAL_US = 200_000L
  }

  /** The measured frame rate, or `null` while nothing can be said about it yet. */
  @Volatile
  var frameRate: Float? = null
    private set

  /**
   * Whether enough frames have been timed to have an opinion. Together with a null
   * [frameRate] this is what tells "still measuring" apart from "this content has no fixed
   * frame rate", which are very different things to report to someone.
   */
  @Volatile
  var hasEnoughSamples: Boolean = false
    private set

  private val intervalsUs = LongArray(WINDOW)
  private val sortedUs = LongArray(WINDOW)
  private var sampleCount = 0
  private var writeIndex = 0
  private var framesSinceEstimate = 0
  private var lastPresentationTimeUs = C.TIME_UNSET

  /** Called on the playback thread, once per frame about to be rendered. */
  fun onFrameRendered(presentationTimeUs: Long) {
    val previousTimeUs = lastPresentationTimeUs

    lastPresentationTimeUs = presentationTimeUs

    if (previousTimeUs == C.TIME_UNSET) {
      return
    }

    val intervalUs = presentationTimeUs - previousTimeUs

    // a seek, a source change or a gap in the stream, none of which is a frame interval
    if (intervalUs < MIN_INTERVAL_US || intervalUs > MAX_INTERVAL_US) {
      return
    }

    intervalsUs[writeIndex] = intervalUs
    writeIndex = (writeIndex + 1) % WINDOW

    if (sampleCount < WINDOW) {
      sampleCount++
    }

    framesSinceEstimate++

    if (sampleCount < WINDOW || framesSinceEstimate < ESTIMATE_EVERY) {
      return
    }

    framesSinceEstimate = 0

    estimate()
  }

  /**
   * The median interval, and how much of the window agrees with it.
   *
   * A median rather than a mean because a single dropped or repeated frame would drag a
   * mean far enough to miss the 0.2% the mode matcher works to, where it barely moves a
   * median. The agreement check is what keeps variable frame rate content - where there is
   * no single right answer - from being reported as though there were one.
   */
  private fun estimate() {
    intervalsUs.copyInto(sortedUs)
    sortedUs.sort()

    val medianUs = sortedUs[WINDOW / 2]

    if (medianUs <= 0L) {
      return
    }

    val agreeing = sortedUs.count { abs(it - medianUs).toDouble() / medianUs <= MAX_DEVIATION }

    hasEnoughSamples = true
    frameRate = if (agreeing >= WINDOW * MIN_AGREEMENT) 1_000_000f / medianUs else null
  }
}
