package expo.modules.afr

import android.app.UiModeManager
import android.content.Context
import android.content.pm.PackageManager
import android.content.res.Configuration
import android.os.Bundle
import androidx.core.os.bundleOf
import androidx.media3.common.util.UnstableApi
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * The JS end of auto frame rate matching: a switch, and enough of an answer about what
 * happened to tell a device that cannot do it from a stream that did not say what it is.
 *
 * All the work happens in [AutoFrameRatePlugin], which react-native-video drives - JS
 * never sees a frame rate and has nothing to hand over. This module exists to own the
 * plugin's lifetime, to hold the user's setting, and to report back.
 */
@UnstableApi
class ReactNativeAfrModule : Module() {
  private var plugin: AutoFrameRatePlugin? = null

  override fun definition() = ModuleDefinition {
    Name("ReactNativeAfr")

    OnCreate {
      // Registering is what the base class constructor does. react-native-video's registry
      // keys plugins by name, so the instance from a previous JS runtime (a reload in
      // development) is replaced rather than left behind next to this one.
      plugin = AutoFrameRatePlugin { appContext.activityProvider?.currentActivity }
    }

    OnDestroy {
      // puts the display back before this instance stops being the one being driven
      plugin?.isEnabled = false
      plugin = null
    }

    /**
     * Whether matching can be attempted at all. It being true says nothing about whether
     * the display will honour it - only [getStatus] can answer that, and only once
     * something has played.
     */
    Function("isSupported") {
      isSupported()
    }

    Function("setEnabled") { isEnabled: Boolean ->
      plugin?.isEnabled = isEnabled && isSupported()
    }

    /** What the last attempt did, for the diagnostics on the settings screen. */
    Function("getStatus") {
      val plugin = plugin

      bundleOf(
        "isEnabled" to (plugin?.isEnabled ?: false),
        "contentFrameRate" to plugin?.contentFrameRate,
        "appliedRefreshRate" to plugin?.appliedRefreshRate,
        "displayRefreshRate" to currentMode()?.refreshRate,
        "outcome" to (plugin?.outcome ?: AutoFrameRatePlugin.OUTCOME_IDLE)
      )
    }

    /**
     * Every mode the display admits to, which is the one thing worth looking at before
     * blaming the code: a device that reports a single mode cannot switch, whatever its
     * HDMI output is capable of.
     */
    Function("getDisplayModes") {
      displayModes()
    }
  }

  /**
   * Matching is a TV feature. A phone panel has a fixed refresh rate the app cannot
   * usefully change for a video, so the switch is hidden there rather than offered and
   * quietly doing nothing.
   */
  private fun isSupported(): Boolean {
    if (!DisplayModeSwitcher.isAvailable()) {
      return false
    }

    val context = appContext.reactContext ?: return false

    if (context.packageManager.hasSystemFeature(PackageManager.FEATURE_LEANBACK)) {
      return true
    }

    val uiModeManager = context.getSystemService(Context.UI_MODE_SERVICE) as? UiModeManager

    return uiModeManager?.currentModeType == Configuration.UI_MODE_TYPE_TELEVISION
  }

  private fun currentMode(): DisplayModeSpec? =
    appContext.activityProvider?.currentActivity?.let { DisplayModeSwitcher.currentMode(it) }

  private fun displayModes(): List<Bundle> {
    val activity = appContext.activityProvider?.currentActivity ?: return emptyList()

    return DisplayModeSwitcher.supportedModes(activity).map {
      bundleOf(
        "id" to it.id,
        "width" to it.width,
        "height" to it.height,
        "refreshRate" to it.refreshRate
      )
    }
  }
}
