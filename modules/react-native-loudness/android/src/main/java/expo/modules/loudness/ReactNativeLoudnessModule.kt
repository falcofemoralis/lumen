package expo.modules.loudness

import android.media.audiofx.AudioEffect
import android.util.Log
import androidx.core.os.bundleOf
import androidx.media3.common.util.UnstableApi
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.util.UUID

/**
 * The JS end of volume normalization: which strength to use, and enough of an answer to
 * tell a device that cannot do this from a film that simply is not very dynamic.
 *
 * All the work happens in [LoudnessPlugin], which react-native-video drives - JS never
 * sees an audio session and has nothing to hand over. This module exists to own the
 * plugin's lifetime, to hold the user's setting, and to report back.
 */
@UnstableApi
class ReactNativeLoudnessModule : Module() {
  companion object {
    private const val TAG = "Loudness"

    /**
     * `AudioEffect.EFFECT_TYPE_DYNAMICS_PROCESSING` and
     * `AudioEffect.EFFECT_TYPE_LOUDNESS_ENHANCER`, written out rather than referenced.
     *
     * The first of those constants only exists from Android 9, and a static field that is
     * missing at runtime is a `NoSuchFieldError` rather than something catchable - which
     * is a poor way to find out that a device is old. The values are part of the platform
     * ABI and have not changed since the effects were introduced.
     */
    private val DYNAMICS_PROCESSING_TYPE = UUID.fromString("7261676f-6d75-7369-6364-28e2fd3ac39e")
    private val LOUDNESS_ENHANCER_TYPE = UUID.fromString("fe3199be-aed0-413f-87bb-11260eb63cf1")
  }

  private var plugin: LoudnessPlugin? = null

  /** Asked of the audio server, so worth asking once rather than on every settings render. */
  private val isSupported: Boolean by lazy { queryIsSupported() }

  override fun definition() = ModuleDefinition {
    Name("ReactNativeLoudness")

    OnCreate {
      // Registering is what the base class constructor does. react-native-video's registry
      // keys plugins by name, so the instance from a previous JS runtime (a reload in
      // development) is replaced rather than left behind next to this one.
      plugin = LoudnessPlugin()
    }

    OnDestroy {
      // takes the effect off the session before this instance stops being the one being
      // driven, so a reload cannot leave a compressor nothing owns on a playing session
      plugin?.strength = LoudnessStrength.OFF
      plugin = null
    }

    /**
     * Whether the device implements either effect. It being true says nothing about
     * whether a particular film will sound different - a passthrough setup decodes
     * nothing on the device, and there is no way to know that from here.
     */
    Function("isSupported") {
      isSupported
    }

    Function("setStrength") { strength: String ->
      plugin?.strength = if (isSupported) LoudnessStrength.from(strength) else LoudnessStrength.OFF
    }

    /** What is actually attached right now, for the diagnostics on the settings screen. */
    Function("getStatus") {
      val plugin = plugin

      bundleOf(
        "strength" to (plugin?.strength ?: LoudnessStrength.OFF).key,
        "isAttached" to (plugin?.isAttached ?: false),
        "sessionId" to (plugin?.sessionId ?: 0),
        "implementation" to (plugin?.implementation ?: LoudnessImplementation.NONE).key
      )
    }
  }

  /**
   * Effects are optional for a device to implement, and a good number of cheap TV boxes
   * ship without them. Asking the audio server what it has is the only way to know before
   * trying, and the point of knowing is to hide a switch that could not do anything.
   *
   * A device that will not answer at all is taken at its word rather than written off:
   * showing a switch that turns out to do nothing is the smaller failure of the two.
   */
  private fun queryIsSupported(): Boolean {
    val effects = try {
      AudioEffect.queryEffects()
    } catch (e: RuntimeException) {
      Log.w(TAG, "The audio server would not list its effects", e)

      return true
    } ?: return true

    return effects.any {
      it.type == DYNAMICS_PROCESSING_TYPE || it.type == LOUDNESS_ENHANCER_TYPE
    }
  }
}
