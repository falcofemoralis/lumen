package expo.modules.webcookies

import android.webkit.CookieManager
import android.webkit.WebSettings
import expo.modules.kotlin.functions.Queues
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * Reads and clears the WebView's cookie store.
 *
 * The app keeps its own cookie jar and puts it on every request itself, because RN's
 * fetch does not; a WebView is a second, separate store that nothing in JS can see.
 * That matters for a bot check solved in a WebView: Cloudflare's clearance cookie is
 * `HttpOnly`, so the page's own `document.cookie` cannot read it back out and hand it
 * over -- only the native store has it.
 *
 * Android only. `CookieManager` lives in the framework, so there is nothing to fall
 * back to elsewhere and nothing extra to depend on here.
 */
class ReactNativeWebCookiesModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ReactNativeWebCookies")

    /**
     * Every cookie the WebView holds for `url`, `HttpOnly` ones included, in the
     * `name=value; name=value` form a `Cookie` request header takes. Empty when the
     * store has nothing for that URL.
     *
     * Only names and values: the store does not hand back the attributes (expiry,
     * domain, flags) it was given, so a caller that needs an expiry has to carry its
     * own.
     */
    AsyncFunction("getCookies") { url: String ->
      cookieManager()?.getCookie(url) ?: ""
    }.runOnQueue(Queues.MAIN)

    /**
     * Drops the whole store, for a sign-out: the session it holds belongs to the
     * account being left behind, and the next solve should start from nothing.
     *
     * Answers whether there was a store to clear at all.
     */
    AsyncFunction("clearCookies") {
      val manager = cookieManager()

      manager?.removeAllCookies(null)
      manager?.flush()

      manager != null
    }.runOnQueue(Queues.MAIN)

    /**
     * The user agent this device's WebView describes itself with out of the box.
     *
     * The browser version in it is the one actually installed, which a bot check can
     * see for itself by measuring what the engine can do -- so it is the version an
     * app has to claim if it wants the claim to hold up. Empty when there is no
     * WebView to ask.
     */
    AsyncFunction("getDefaultUserAgent") {
      try {
        WebSettings.getDefaultUserAgent(appContext.reactContext) ?: ""
      } catch (_: Throwable) {
        ""
      }
    }.runOnQueue(Queues.MAIN)

    /**
     * Writes the store to disk. The WebView does this on its own schedule, so a
     * cookie earned seconds before the process is killed can otherwise be lost.
     */
    AsyncFunction("flush") {
      cookieManager()?.flush()

      Unit
    }.runOnQueue(Queues.MAIN)
  }
}

/**
 * The store, or null on a device whose WebView cannot be loaded -- it is a separately
 * updatable package and can be missing or mid-update, in which case `getInstance()`
 * throws rather than returning null. A caller that has no cookies to read is in the
 * same position either way, so this is worth swallowing rather than crashing over.
 */
private fun cookieManager(): CookieManager? = try {
  CookieManager.getInstance().also { it.setAcceptCookie(true) }
} catch (_: Throwable) {
  null
}
