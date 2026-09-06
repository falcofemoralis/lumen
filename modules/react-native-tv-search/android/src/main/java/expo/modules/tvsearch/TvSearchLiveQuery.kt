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
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit

/**
 * Runs the real search - the JS one, the same `service.search()` the search screen
 * calls - on behalf of [TvSearchSuggestionProvider].
 *
 * The provider blocks on [awaitResults] until this publishes, which is not an
 * optimisation but the only thing that works. Returning from `query()` and letting the
 * search finish in the background looks reasonable and fails completely: with no bound
 * component left, the process drops straight to cached, and Android 12+ freezes it
 * (`ActivityManager: freezing ... com.falcofemoralis.lumen`) before the JS runtime has
 * even started. The task never runs, nothing is ever published, and every caller sees
 * an empty cursor forever. A process serving a synchronous binder transaction is not
 * cached, so holding the binder thread is what keeps the runtime alive long enough to
 * answer - and it is what every other TV app doing this does.
 *
 * Only one search runs at a time, and a newer query replaces whatever was queued behind
 * it rather than piling up: the search UI queries on every keystroke, and a query the
 * user has already typed past is worth nothing by the time it would return. Waiters on
 * a query that gets superseded are woken immediately rather than left to time out.
 */
internal object TvSearchLiveQuery : HeadlessJsTaskEventListener {
  /** Must match the name the JS side registers with `AppRegistry.registerHeadlessTask`. */
  private const val TASK_KEY = "TvSearchQuery"

  /**
   * A search is one request plus a parse, but it may have to solve a proof-of-work
   * challenge and pick a working mirror first. Generous, since this only bounds the
   * runtime's own housekeeping - what the caller actually waits for is the far shorter
   * timeout it passes to [awaitResults].
   */
  private const val TASK_TIMEOUT_MS = 60L * 1000

  private val handler = Handler(Looper.getMainLooper())
  private val lock = Any()

  private var applicationContext: Context? = null

  /** The most recent query asked for, cleared once it is handed to JS. */
  private var pendingQuery: String? = null

  private var taskContext: HeadlessJsTaskContext? = null
  private var runningTaskId: Int? = null
  private var runningQueryKey: String? = null

  /** Binder threads parked in [awaitResults], by the query key they are waiting on. */
  private val waiters = mutableMapOf<String, MutableSet<CountDownLatch>>()

  private val runPendingTask = Runnable { runPending() }

  /**
   * Searches [query] and blocks until the results are published or [timeoutMs] passes.
   *
   * Must never be called from the main thread: the JS runtime is started on it, so
   * blocking there would deadlock against the very thing being waited for.
   *
   * @return whether results were published in time. On `false` the caller still reads
   *   the store - a search that timed out here may have been a slow one that lands a
   *   moment later, and the next caller gets it from the cache.
   */
  fun awaitResults(context: Context, query: String, timeoutMs: Long): Boolean {
    val queryKey = TvSearchStore.normalize(query)
    val latch = CountDownLatch(1)

    synchronized(lock) {
      waiters.getOrPut(queryKey) { mutableSetOf() }.add(latch)
    }

    request(context, query)

    return try {
      latch.await(timeoutMs, TimeUnit.MILLISECONDS)
    } catch (e: InterruptedException) {
      Thread.currentThread().interrupt()

      false
    } finally {
      synchronized(lock) {
        val latches = waiters[queryKey]

        if (latches != null) {
          latches.remove(latch)

          if (latches.isEmpty()) {
            waiters.remove(queryKey)
          }
        }
      }
    }
  }

  /** Wakes everything parked on [queryKey]. Called once its results are in the store. */
  fun releaseWaiters(queryKey: String) {
    val latches = synchronized(lock) { waiters[queryKey]?.toList() } ?: return

    latches.forEach { it.countDown() }
  }

  /** Queues [query] to be searched, replacing any query still waiting to start. */
  private fun request(context: Context, query: String) {
    val superseded = synchronized(lock) {
      applicationContext = context.applicationContext

      val previous = pendingQuery

      pendingQuery = query

      previous?.let { TvSearchStore.normalize(it) }?.takeIf { it != TvSearchStore.normalize(query) }
    }

    // it will never be searched now, so anything waiting on it would only sit there
    // until its timeout - it is woken to read whatever the cache holds instead
    superseded?.let { releaseWaiters(it) }

    // called from a binder thread; the react host has to be driven from the UI thread.
    // Posted rather than delayed: a caller is blocked on this, and the single pending
    // slot above already collapses a burst of keystrokes into one search.
    handler.removeCallbacks(runPendingTask)
    handler.post(runPendingTask)
  }

  /** Drops a query that has not started yet, ex. because the feature was switched off. */
  fun cancelPending() {
    handler.removeCallbacks(runPendingTask)

    val dropped = synchronized(lock) {
      val pending = pendingQuery?.let { TvSearchStore.normalize(it) }

      pendingQuery = null

      pending
    }

    dropped?.let { releaseWaiters(it) }
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

    val reactHost = (context as? ReactApplication)?.reactHost

    if (reactHost == null) {
      // nothing will ever publish for this one, so it must not hold anyone up
      releaseWaiters(TvSearchStore.normalize(query))

      return
    }

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
        runningQueryKey = TvSearchStore.normalize(query)
      }
    }
  }

  override fun onHeadlessJsTaskStart(taskId: Int) = Unit

  override fun onHeadlessJsTaskFinish(taskId: Int) {
    val (finishedKey, hasPending) = synchronized(lock) {
      if (taskId != runningTaskId) {
        return
      }

      val finishedKey = runningQueryKey

      taskContext?.removeTaskEventListener(this)
      taskContext = null
      runningTaskId = null
      runningQueryKey = null

      finishedKey to (pendingQuery != null)
    }

    // the task is done whether or not it published - it may have found nothing, thrown,
    // or bailed because the app is not configured yet. Either way the wait is over, and
    // leaving a caller to time out on a search that already finished is the worst of it.
    finishedKey?.let { releaseWaiters(it) }

    // whatever the user typed while this one was running, searched now that the slot
    // is free
    if (hasPending) {
      handler.post(runPendingTask)
    }
  }
}
