package expo.modules.tvsearch

import android.app.SearchManager
import android.app.UiModeManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.content.res.Configuration
import android.os.Bundle
import android.provider.MediaStore
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * The JS end of the Android TV global search integration, see
 * https://developer.android.com/training/tv/discovery/searchable
 *
 * There are two directions here. Going out, the system asks
 * [TvSearchSuggestionProvider] for suggestions and it asks JS to run the real search;
 * `publishResults` is how the answer comes back, and notifying the search UI is its
 * whole point. Coming in, the app is also a search *target*: the searchable
 * configuration lets the launcher hand a typed or spoken query straight to the app,
 * which arrives as an ACTION_SEARCH intent and is surfaced here so JS can open the
 * search screen on it.
 */
class ReactNativeTvSearchModule : Module() {
  companion object {
    private const val EVENT_SEARCH_REQUESTED = "onSearchRequested"

    private const val ERROR_PUBLISH = "ERR_TV_SEARCH_PUBLISH"
  }

  override fun definition() = ModuleDefinition {
    Name("ReactNativeTvSearch")

    Events(EVENT_SEARCH_REQUESTED)

    Function("isSupported") {
      isSupported()
    }

    /**
     * Mirrors the user's setting to the native side. The provider is called before
     * there is any JS to ask, so it reads the flag from storage - see
     * [TvSearchStore.isEnabled].
     */
    AsyncFunction("setEnabled") { isEnabled: Boolean, promise: Promise ->
      val store = store

      store.isEnabled = isEnabled

      if (!isEnabled) {
        // a query queued a moment ago would otherwise still start the app up to run a
        // search whose results nothing is allowed to show
        TvSearchLiveQuery.cancelPending()
        store.clear()
      }

      promise.resolve(null)
    }

    /**
     * Stores what the search found and tells the search UI to come back for it.
     *
     * Publishing an empty list is meaningful and expected: it records that the query
     * was searched and found nothing, which is what keeps every following keystroke
     * from searching it again.
     */
    AsyncFunction("publishResults") { query: String, results: List<TvSearchResult>, promise: Promise ->
      try {
        val context = context
        val queryKey = TvSearchStore.normalize(query)

        store.writeRows(queryKey, results.map { it.toRow() })

        // first, and before the notification: there is a binder thread parked inside
        // `query()` on exactly this, and everything it needs is now in the store
        TvSearchLiveQuery.releaseWaiters(queryKey)

        val authority = TvSearchSuggestionProvider.findAuthority(context)

        if (authority != null) {
          context.contentResolver.notifyChange(
            TvSearchSuggestionProvider.notificationUri(authority, queryKey),
            null
          )
        }

        promise.resolve(null)
      } catch (e: Exception) {
        promise.reject(ERROR_PUBLISH, "Failed to publish the search results: ${e.describe()}", e)
      }
    }

    /** Drops every cached result, ex. after switching to a different provider. */
    AsyncFunction("clearResults") { promise: Promise ->
      store.clear()
      promise.resolve(null)
    }

    /**
     * The query the app was opened with, if it was opened by a search rather than by
     * the user. Consumed as it is read: the intent outlives the screen that acts on it,
     * and a remount re-running the search the user has since navigated away from is
     * worse than missing it.
     */
    Function("getInitialSearchQuery") {
      val intent = appContext.activityProvider?.currentActivity?.intent ?: return@Function null

      intent.searchQuery()?.also { intent.removeExtra(SearchManager.QUERY) }
    }

    /** A search arriving while the app is already up, rather than starting it. */
    OnNewIntent { intent ->
      intent.searchQuery()?.let { query ->
        intent.removeExtra(SearchManager.QUERY)
        sendEvent(EVENT_SEARCH_REQUESTED, Bundle().apply { putString("query", query) })
      }
    }
  }

  private val context: Context
    get() = requireNotNull(appContext.reactContext) { "React context is not available" }

  private val store: TvSearchStore
    get() = TvSearchStore.getInstance(context)

  /**
   * Global search is a TV surface. Phones have their own search that does not consult
   * app suggestion providers, so the feature is reported unsupported there rather than
   * quietly maintaining a cache nothing reads.
   */
  private fun isSupported(): Boolean {
    val reactContext = appContext.reactContext ?: return false

    if (reactContext.packageManager.hasSystemFeature(PackageManager.FEATURE_LEANBACK)) {
      return true
    }

    val uiModeManager = reactContext.getSystemService(Context.UI_MODE_SERVICE) as? UiModeManager

    return uiModeManager?.currentModeType == Configuration.UI_MODE_TYPE_TELEVISION
  }

  /**
   * The query carried by a search intent, if this is one. The assistant sends a media
   * search ("play ...") where the launcher's search box sends a plain one; both put the
   * text in the same extra.
   */
  private fun Intent.searchQuery(): String? {
    if (action != Intent.ACTION_SEARCH && action != MediaStore.INTENT_ACTION_MEDIA_SEARCH) {
      return null
    }

    return getStringExtra(SearchManager.QUERY)?.trim()?.takeIf { it.isNotEmpty() }
  }

  private fun TvSearchResult.toRow() = TvSearchRow(
    id = id,
    title = title,
    subtitle = subtitle,
    posterUri = posterUri,
    intentData = intentData,
    contentType = contentType,
    productionYear = productionYear
  )

  /** Bare messages like "null" say nothing on the JS side, the type usually does. */
  private fun Exception.describe(): String = "${this::class.java.simpleName}: ${message ?: "no message"}"
}
