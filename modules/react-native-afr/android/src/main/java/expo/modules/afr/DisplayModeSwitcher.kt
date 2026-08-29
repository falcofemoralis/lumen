package expo.modules.afr

import android.app.Activity
import android.os.Build
import android.view.Display

/**
 * Reads the display modes the device offers and asks for one of them.
 *
 * `WindowManager.LayoutParams.preferredDisplayModeId` is the path taken here rather than
 * `Surface.setFrameRate`, because it reaches every Android TV back to Android 6 where the
 * surface API only arrived in Android 11 (and only gained the ability to force a
 * non-seamless change, which is every 60Hz-to-24Hz switch, in Android 12).
 *
 * It is a property of *this app's window*, which is what makes it safe: the system only
 * honours it while that window is the one on screen, so the display goes back to its own
 * mode when the app is backgrounded or killed even if nothing restores it.
 */
object DisplayModeSwitcher {
  /** `Display.Mode` and `preferredDisplayModeId` both arrived in Android 6. */
  fun isAvailable(): Boolean = Build.VERSION.SDK_INT >= Build.VERSION_CODES.M

  fun currentMode(activity: Activity): DisplayModeSpec? {
    if (!isAvailable()) {
      return null
    }

    return display(activity)?.mode?.toSpec()
  }

  /**
   * Every mode the display admits to. A good few Android TV devices report exactly one
   * even though their HDMI output can do more, which is the main reason this feature
   * cannot be promised to work on a given box - see [AutoFrameRatePlugin].
   */
  fun supportedModes(activity: Activity): List<DisplayModeSpec> {
    if (!isAvailable()) {
      return emptyList()
    }

    return display(activity)?.supportedModes?.map { it.toSpec() }.orEmpty()
  }

  /** Has to be called on the UI thread - it writes the window attributes. */
  fun apply(activity: Activity, modeId: Int) {
    if (!isAvailable()) {
      return
    }

    val window = activity.window ?: return
    val attributes = window.attributes

    // re-assigning the same id still re-applies the window attributes, which on some
    // devices is enough to make the display re-sync
    if (attributes.preferredDisplayModeId == modeId) {
      return
    }

    attributes.preferredDisplayModeId = modeId
    window.attributes = attributes
  }

  /** Hands the choice back to the system, ex. when playback is over. */
  fun clear(activity: Activity) = apply(activity, 0)

  private fun display(activity: Activity): Display? =
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
      activity.display
    } else {
      @Suppress("DEPRECATION")
      activity.windowManager?.defaultDisplay
    }

  private fun Display.Mode.toSpec() = DisplayModeSpec(
    id = modeId,
    width = physicalWidth,
    height = physicalHeight,
    refreshRate = refreshRate
  )
}
