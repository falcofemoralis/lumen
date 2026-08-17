package expo.modules.afr

import android.app.Activity
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.Surface
import android.view.SurfaceView
import androidx.media3.common.C
import androidx.media3.common.util.UnstableApi
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.exoplayer.video.VideoFrameMetadataListener
import com.twg.video.core.plugins.ReactNativeVideoPlugin
import com.twg.video.view.VideoView
import java.lang.ref.WeakReference
import kotlin.math.abs

/**
 * Matches the display's refresh rate to the frame rate of whatever the player is playing
 * - "auto frame rate", the thing that makes a 24fps film run without judder on a 60Hz TV.
 *
 * It hooks into react-native-video through its plugin API, which is the only way to reach
 * the frame rate: the player knows it (ExoPlayer reports it on the selected video format)
 * and nothing on the JS side is told about it.
 *
 * Whether any of this does anything is a property of the device, not of the code. A lot
 * of Android TV boxes report a single display mode even though their HDMI output can
 * switch, and there is no way to find that out other than asking - which is what
 * [ReactNativeAfrModule.getStatus] is for.
 */
@UnstableApi
class AutoFrameRatePlugin(
  private val activityProvider: () -> Activity?
) : ReactNativeVideoPlugin(NAME) {
  companion object {
    const val NAME = "AutoFrameRate"

    /** Nothing is playing, or the feature is off. */
    const val OUTCOME_IDLE = "idle"

    /** The display was asked for a mode that matches the content. */
    const val OUTCOME_SWITCHED = "switched"

    /** The display was already in a mode that carries the content evenly. */
    const val OUTCOME_ALREADY_MATCHED = "alreadyMatched"

    /** No display mode matched, but Android 12+ let the surface ask for the rate directly. */
    const val OUTCOME_SURFACE_REQUESTED = "surfaceRequested"

    /** The display offers nothing that fits - the usual answer on a device with one mode. */
    const val OUTCOME_NO_MATCH = "noMatch"

    /** Not enough frames have been timed yet to know what is playing. */
    const val OUTCOME_MEASURING = "measuring"

    /** The content has no fixed frame rate, so there is nothing to match it to. */
    const val OUTCOME_NO_FRAME_RATE = "noFrameRate"

    /** The device has no display mode API at all, i.e. below Android 6. */
    const val OUTCOME_UNSUPPORTED = "unsupported"

    private const val TAG = "AutoFrameRate"

    /**
     * How often the player is asked what it is playing.
     *
     * There is deliberately no listener here. The ExoPlayer instance behind a
     * `VideoPlayer` is *replaced* when a source is first loaded and *reused* when one is
     * swapped in - and this app swaps sources for every quality change and every episode
     * (`replaceSourceAsync`). A listener would have to be attached, dropped and
     * re-attached in step with react-native-video's own lifecycle, which is internal and
     * has no callback for it. Reading two fields once a second while a video view is on
     * screen costs nothing and cannot fall out of step with any of that.
     */
    private const val POLL_INTERVAL_MS = 1000L

    /** How much a newly measured frame rate has to move before it counts as a new one. */
    private const val FRAME_RATE_EPSILON = 0.005f
  }

  var isEnabled: Boolean = false
    set(value) {
      if (field == value) {
        return
      }

      field = value

      handler.post { if (value) startPolling() else stop() }
    }

  /** The frame rate the player last reported, `null` when nothing is playing. */
  @Volatile
  var contentFrameRate: Float? = null
    private set

  /** The refresh rate the display was last asked for, `null` when nothing was asked. */
  @Volatile
  var appliedRefreshRate: Float? = null
    private set

  /** One of the `OUTCOME_*` constants, i.e. what happened on the last attempt. */
  @Volatile
  var outcome: String = OUTCOME_IDLE
    private set

  private val handler = Handler(Looper.getMainLooper())

  /**
   * Views are tracked rather than players because the view is what says whether a video
   * is on screen, and a player outlives its view (background audio, picture in picture).
   */
  private val views = mutableListOf<WeakReference<VideoView>>()

  /** The player whose frame rate strategy was already taken over, to only do it once. */
  private var configuredPlayer: WeakReference<ExoPlayer>? = null

  /** Times the frames of the player above, since the streams here rarely declare a rate. */
  private var estimator: FrameRateEstimator? = null

  /** Kept so it can be handed back to `clearVideoFrameMetadataListener` on the way out. */
  private var frameListener: VideoFrameMetadataListener? = null

  private var isPolling = false

  override fun onVideoViewCreated(view: WeakReference<VideoView>) {
    handler.post {
      views.add(view)

      if (isEnabled) {
        startPolling()
      }
    }
  }

  override fun onVideoViewDestroyed(view: WeakReference<VideoView>) {
    val destroyed = view.get()

    handler.post {
      views.removeAll { it.get() == null || it.get() === destroyed }

      if (views.isEmpty()) {
        stop()
      }
    }
  }

  private val poll = object : Runnable {
    override fun run() {
      if (!isPolling) {
        return
      }

      // the newest view is the one on screen: a player handed to a second view (going
      // fullscreen, entering picture in picture) leaves the first one behind
      val view = liveViews().lastOrNull()

      if (view == null) {
        stop()

        return
      }

      sync(view)

      handler.postDelayed(this, POLL_INTERVAL_MS)
    }
  }

  private fun startPolling() {
    if (isPolling || views.isEmpty()) {
      return
    }

    isPolling = true
    poll.run()
  }

  private fun stop() {
    isPolling = false
    handler.removeCallbacks(poll)

    // hand media3's own frame rate handling back, and stop being handed frames, so
    // switching the setting off leaves the player the way it would have been had this
    // never run
    try {
      configuredPlayer?.get()?.let { player ->
        player.setVideoChangeFrameRateStrategy(C.VIDEO_CHANGE_FRAME_RATE_STRATEGY_ONLY_IF_SEAMLESS)
        frameListener?.let { player.clearVideoFrameMetadataListener(it) }
      }
    } catch (e: IllegalStateException) {
      Log.d(TAG, "Player was already gone", e)
    }

    configuredPlayer = null
    frameListener = null
    estimator = null
    contentFrameRate = null
    appliedRefreshRate = null
    outcome = OUTCOME_IDLE

    activityProvider()?.let { DisplayModeSwitcher.clear(it) }
  }

  private fun sync(view: VideoView) {
    val player = view.hybridPlayer?.player ?: return

    try {
      if (configuredPlayer?.get() !== player) {
        // media3 calls Surface.setFrameRate on its own, but only ever asks for a change
        // the display can make seamlessly - which no TV can between 60Hz and 24Hz, so it
        // is a no-op there. Turning it off leaves one voice asking for a rate instead of
        // two disagreeing.
        player.setVideoChangeFrameRateStrategy(C.VIDEO_CHANGE_FRAME_RATE_STRATEGY_OFF)

        startMeasuring(player)

        configuredPlayer = WeakReference(player)
        contentFrameRate = null
      }

      // The declared rate first, since a manifest that carries one is telling the truth
      // for free. It is Format.NO_VALUE for everything this app plays though - a plain MP4
      // URL declares nothing, and the master playlist built for automatic quality has no
      // FRAME-RATE attribute - so in practice the measured rate is the one that answers.
      val frameRate = player.videoFormat?.frameRate?.takeIf { it > 0f }
        ?: estimator?.frameRate

      if (frameRate == null) {
        outcome = if (estimator?.hasEnoughSamples == true) {
          OUTCOME_NO_FRAME_RATE
        } else {
          OUTCOME_MEASURING
        }

        return
      }

      // A measured rate wobbles in its last decimals as the median moves by a microsecond,
      // so it is compared loosely - re-running the match on noise would rewrite the state
      // the settings feedback reads for no reason.
      val previousFrameRate = contentFrameRate

      if (previousFrameRate != null &&
        abs(frameRate - previousFrameRate) / previousFrameRate < FRAME_RATE_EPSILON
      ) {
        return
      }

      contentFrameRate = frameRate

      apply(view, frameRate)
    } catch (e: IllegalStateException) {
      // a player released between the null check and the read - the next tick picks up
      // whatever replaced it
      Log.d(TAG, "Player went away while reading its format", e)
    }
  }

  /**
   * Starts timing the frames of a player that has just taken over.
   *
   * A fresh estimator rather than a reset one: frames arrive on the playback thread and
   * would keep arriving during a reset, where a new instance cannot be handed a single
   * interval that belongs to the source before it.
   */
  private fun startMeasuring(player: ExoPlayer) {
    configuredPlayer?.get()?.let { previous ->
      frameListener?.let { previous.clearVideoFrameMetadataListener(it) }
    }

    val estimator = FrameRateEstimator()
    val listener = VideoFrameMetadataListener { presentationTimeUs, _, _, _ ->
      estimator.onFrameRendered(presentationTimeUs)
    }

    this.estimator = estimator
    frameListener = listener

    player.setVideoFrameMetadataListener(listener)
  }

  private fun apply(view: VideoView, frameRate: Float) {
    val activity = activityProvider() ?: return
    val current = DisplayModeSwitcher.currentMode(activity)

    if (current == null) {
      outcome = OUTCOME_UNSUPPORTED

      return
    }

    val match = FrameRateMatcher.match(
      modes = DisplayModeSwitcher.supportedModes(activity),
      current = current,
      contentFrameRate = frameRate
    )

    outcome = when (match) {
      is FrameRateMatch.Switch -> {
        DisplayModeSwitcher.apply(activity, match.mode.id)
        appliedRefreshRate = match.mode.refreshRate

        OUTCOME_SWITCHED
      }

      FrameRateMatch.AlreadyMatched -> {
        appliedRefreshRate = current.refreshRate

        OUTCOME_ALREADY_MATCHED
      }

      // The display exposes no mode for this frame rate, which on a lot of TV boxes means
      // it exposes no modes at all. Android 12 can still be asked through the surface,
      // and some of those devices answer it.
      FrameRateMatch.NoMatch ->
        if (requestSurfaceFrameRate(view, frameRate)) OUTCOME_SURFACE_REQUESTED else OUTCOME_NO_MATCH

      FrameRateMatch.UnknownFrameRate -> OUTCOME_NO_FRAME_RATE
    }

    Log.d(TAG, "Content at ${frameRate}fps on a ${current.refreshRate}Hz display: $outcome")
  }

  /**
   * Asks the display pipeline for the rate through the surface the video is drawn on.
   *
   * This is the fallback rather than the primary path because it can only force a
   * non-seamless change - the kind every 60Hz-to-24Hz switch is - from Android 12, and
   * because it needs a surface that is already up, where the window attribute can be set
   * before anything has been drawn.
   */
  private fun requestSurfaceFrameRate(view: VideoView, frameRate: Float): Boolean {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) {
      return false
    }

    // a TextureView draws into the app's own window and has no surface of its own to set
    // a rate on, so this only works with react-native-video's default surface type
    val surface = (view.playerView.videoSurfaceView as? SurfaceView)?.holder?.surface

    if (surface == null || !surface.isValid) {
      return false
    }

    return try {
      surface.setFrameRate(
        frameRate,
        Surface.FRAME_RATE_COMPATIBILITY_FIXED_SOURCE,
        Surface.CHANGE_FRAME_RATE_ALWAYS
      )

      true
    } catch (e: IllegalStateException) {
      Log.w(TAG, "Surface refused the frame rate request", e)

      false
    }
  }

  private fun liveViews(): List<VideoView> {
    views.removeAll { it.get() == null }

    return views.mapNotNull { it.get() }
  }
}
