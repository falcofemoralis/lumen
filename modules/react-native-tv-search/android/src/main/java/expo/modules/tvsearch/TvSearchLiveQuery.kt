package expo.modules.tvsearch

import android.content.Context
import android.os.Handler
import android.os.Looper
import com.facebook.react.ReactApplication
import com.facebook.react.ReactInstanceEventListener
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.jstasks.HeadlessJsTaskConfig
import com.facebook.react.jstasks.HeadlessJsTaskContext
import com.facebook.react.jstasks.HeadlessJsTaskEventListener

/**
 * Runs the real search - the JS one, the same `service.search()` the search screen
 * calls - on behalf of [TvSearchSuggestionProvider], which cannot wait for it.
 *
 * The provider fires and forgets: this brings up a headless JS runtime if the app is
 * not already running, hands it the `TvSearchQuery` task, and JS publishes what it
 * finds back through [ReactNativeTvSearchModule.publishResults], which is what
 * notifies the search UI.
 *
 * Two things keep that from being ruinously expensive. The system search UI queries
 * the provider on every keystroke, so requests are debounced and only the last query
 * typed is actually searched; and only one search runs at a time, with a newer request
 * replacing whatever was queued behind it rather than piling up. A search the user has
 * already typed past is worth nothing by the time it would return.
 */
internal object TvSearchLiveQuery : HeadlessJsTaskEventListener {
  /** Must match the name the JS side registers with `AppRegistry.registerHeadlessTask`. */
  private const val TASK_KEY = "TvSearchQuery"

  /**
   * A search is one request plus a parse, but it may have to solve a proof-of-work
   * challenge and pick a working mirror first. Generous, since the only cost of a slow
   * search is that its results arrive after the user has stopped looking - while
   * cutting one short throws away work that was nearly done.
   */
  private const val TASK_TIMEOUT_MS = 60L * 1000

  /**
   * How long typing has to pause before the query is searched for real. Long enough
   * that a word typed at a normal pace is one search rather than one per letter, short
   * enough to feel like it reacts to the user stopping.
   */
  private const val DEBOUNCE_MS = 450L

  private val handler = Handler(Looper.getMainLooper())
  private val lock = Any()

  private var applicationContext: Context? = null

  /** The most recent query asked for, cleared once it is handed to JS. */
  private var pendingQuery: String? = null

  private var taskContext: HeadlessJsTaskContext? = null
  private var runningTaskId: Int? = null

  private val runPendingTask = Runnable { runPending() }

  /** Queues [query] to be searched, replacing any query still waiting to start. */
  fun request(context: Context, query: String) {
    synchronized(lock) {
      applicationContext = context.applicationContext
      pendingQuery = query
    }

    // called from a binder thread; the react host has to be driven from the UI thread
    handler.removeCallbacks(runPendingTask)
    handler.postDelayed(runPendingTask, DEBOUNCE_MS)
  }

  /** Drops a query that has not started yet, ex. because the feature was switched off. */
  fun cancelPending() {
    handler.removeCallbacks(runPendingTask)

    synchronized(lock) {
      pendingQuery = null
    }
  }

  private fun runPending() {
    val (context, query) = synchronized(lock) {
      // a search is already in flight - whatever is pending is picked up when it ends,
      // by which time it may well have been replaced by something newer
      if (runningTaskId != null) {
        return
      }

      val context = applicationContext ?: return
      val query = pendingQuery ?: return

      pendingQuery = null

      context to query
    }

    val reactHost = (context as? ReactApplication)?.reactHost ?: return
    val reactContext = reactHost.currentReactContext

    if (reactContext != null) {
      startTask(reactContext, query)

      return
    }

    // the app is not running - the search box in the launcher is where this usually
    // starts - so a JS runtime has to come up before the query can be handed over
    reactHost.addReactInstanceEventListener(object : ReactInstanceEventListener {
      override fun onReactContextInitialized(context: ReactContext) {
        reactHost.removeReactInstanceEventListener(this)
        startTask(context, query)
      }
    })
    reactHost.start()
  }

  private fun startTask(reactContext: ReactContext, query: String) {
    val context = HeadlessJsTaskContext.getInstance(reactContext)

    synchronized(lock) {
      taskContext = context
    }

    context.addTaskEventListener(this)

    // `startTask` has to run on the UI thread, and the react instance callback above
    // does not promise one
    handler.post {
      val taskId = context.startTask(
        HeadlessJsTaskConfig(
          TASK_KEY,
          Arguments.createMap().apply { putString("query", query) },
          TASK_TIMEOUT_MS,
          // the search box can be opened over the running app, and without this the
          // task would be rejected outright
          true
        )
      )

      synchronized(lock) {
        runningTaskId = taskId
      }
    }
  }

  override fun onHeadlessJsTaskStart(taskId: Int) = Unit

  override fun onHeadlessJsTaskFinish(taskId: Int) {
    val hasPending = synchronized(lock) {
      if (taskId != runningTaskId) {
        return
      }

      taskContext?.removeTaskEventListener(this)
      taskContext = null
      runningTaskId = null

      pendingQuery != null
    }

    // whatever the user typed while this one was running, searched now that the slot
    // is free - without the debounce, which their typing already paid for
    if (hasPending) {
      handler.post(runPendingTask)
    }
  }
}
