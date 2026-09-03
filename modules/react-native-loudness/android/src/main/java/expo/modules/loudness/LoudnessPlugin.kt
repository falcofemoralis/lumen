package expo.modules.loudness

import android.os.Handler
import android.os.Looper
import android.util.Log
import androidx.media3.common.C
import androidx.media3.common.util.UnstableApi
import com.twg.video.core.plugins.NativeVideoPlayer
import com.twg.video.core.plugins.ReactNativeVideoPlugin
import java.lang.ref.WeakReference

/**
 * Volume normalization: a compressor across whatever the player is playing, so that
 * explosions stop being louder than the TV can carry and whispered dialogue stops being
 * inaudible at the same volume setting.
 *
 * It hooks into react-native-video through its plugin API because the compressor attaches
 * to an *audio session*, and the only place that id exists is on the ExoPlayer the
 * library builds internally. Nothing about it reaches JS, so there is nothing to hand
 * over from there - only which strength to use.
 */
@UnstableApi
class LoudnessPlugin : ReactNativeVideoPlugin(NAME) {
  companion object {
    const val NAME = "Loudness"

    private const val TAG = "Loudness"

    /**
     * How often the player is asked which session it is playing on.
     *
     * There is deliberately no listener here, for the reason `AutoFrameRatePlugin`
     * documents and one of its own: the `ExoPlayer` behind a `VideoPlayer` is *replaced*
     * when the first source loads, so the session read at [onPlayerCreated] is not the
     * one that ends up playing, and an `AnalyticsListener` would have to be attached,
     * dropped and re-attached in step with a lifecycle that has no callback for it.
     * Reading one int a second while a player exists costs nothing and cannot fall out
     * of step with any of that.
     */
    private const val POLL_INTERVAL_MS = 1000L
  }

  var strength: LoudnessStrength = LoudnessStrength.OFF
    set(value) {
      if (field == value) {
        return
      }

      field = value

      handler.post {
        when {
          value == LoudnessStrength.OFF -> stop()

          // already running, so the poll would pick the new level up within the second -
          // but someone who just moved the slider is listening for it now
          isPolling -> livePlayers().lastOrNull()?.let { sync(it) }

          else -> startPolling()
        }
      }
    }

  private val handler = Handler(Looper.getMainLooper())

  /**
   * Players are tracked rather than views, unlike the frame rate plugin: background audio
   * and picture in picture are both on, so a player routinely outlives the view it was
   * shown in - and the sound it is still making is exactly what this is here to even out.
   */
  private val players = mutableListOf<WeakReference<NativeVideoPlayer>>()

  private val effect = LoudnessEffect()

  private var isPolling = false

  /** What the effect ended up being, so the settings screen can say when it is nothing. */
  val implementation: LoudnessImplementation
    get() = effect.implementation

  val isAttached: Boolean
    get() = effect.isAttached

  val sessionId: Int
    get() = effect.sessionId

  override fun onPlayerCreated(player: WeakReference<NativeVideoPlayer>) {
    handler.post {
      players.add(player)

      if (strength != LoudnessStrength.OFF) {
        startPolling()
      }
    }
  }

  override fun onPlayerDestroyed(player: WeakReference<NativeVideoPlayer>) {
    val destroyed = player.get()

    handler.post {
      players.removeAll { it.get() == null || it.get() === destroyed }

      if (players.isEmpty()) {
        stop()
      }
    }
  }

  private val poll = object : Runnable {
    override fun run() {
      if (!isPolling) {
        return
      }

      // the newest player is the one being listened to: a second one only exists while
      // the first is being replaced
      val player = livePlayers().lastOrNull()

      if (player == null) {
        stop()

        return
      }

      sync(player)

      handler.postDelayed(this, POLL_INTERVAL_MS)
    }
  }

  private fun startPolling() {
    if (isPolling || players.isEmpty()) {
      return
    }

    isPolling = true
    poll.run()
  }

  private fun stop() {
    isPolling = false
    handler.removeCallbacks(poll)

    effect.release()
  }

  private fun sync(hybridPlayer: NativeVideoPlayer) {
    val sessionId = try {
      hybridPlayer.player.audioSessionId
    } catch (e: IllegalStateException) {
      // a player released between the null check and the read - the next tick picks up
      // whatever replaced it
      Log.d(TAG, "Player went away while reading its audio session", e)

      return
    }

    // Nothing has been played yet, so there is no session to attach to. The audio track
    // is opened on the first buffer, not when the player is built, which is why this is
    // the normal state for the first second of a film.
    if (sessionId == C.AUDIO_SESSION_ID_UNSET) {
      return
    }

    effect.apply(sessionId, strength)
  }

  private fun livePlayers(): List<NativeVideoPlayer> {
    players.removeAll { it.get() == null }

    return players.mapNotNull { it.get() }
  }
}
