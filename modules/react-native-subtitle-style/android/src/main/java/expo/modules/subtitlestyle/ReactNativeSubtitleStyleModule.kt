package expo.modules.subtitlestyle

import androidx.media3.common.util.UnstableApi
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * The JS end of subtitle styling: the settings screen hands a style over, and
 * [SubtitleStylePlugin] puts it on every player that appears afterwards.
 *
 * This module exists to own the plugin's lifetime and to convert what JS sends. All the
 * work is on the other side - JS never sees a `SubtitleView` and has nothing to draw.
 */
@UnstableApi
class ReactNativeSubtitleStyleModule : Module() {
  private var plugin: SubtitleStylePlugin? = null

  override fun definition() = ModuleDefinition {
    Name("ReactNativeSubtitleStyle")

    OnCreate {
      // Registering is what the base class constructor does. react-native-video's registry
      // keys plugins by name, so the instance from a previous JS runtime (a reload in
      // development) is replaced rather than left behind next to this one.
      plugin = SubtitleStylePlugin()
    }

    OnDestroy {
      // A style outliving the runtime that asked for it would be a style nobody can change
      // any more, so the subtitles go back to the system settings on the way out.
      plugin?.setStyle(null)
      plugin = null
    }

    /**
     * Applies a style to every player, now and for the rest of the process. Fields left
     * out fall back to what media3 draws by default rather than to zero.
     */
    Function("setStyle") { style: SubtitleStyleRecord ->
      plugin?.setStyle(style.toSubtitleStyle())
    }

    /** Hands the subtitles back to the device's own captioning settings. */
    Function("resetStyle") {
      plugin?.setStyle(null)
    }
  }
}
