package expo.modules.tvchannels

import android.app.job.JobParameters
import android.app.job.JobService
import com.facebook.react.ReactApplication
import com.facebook.react.ReactInstanceEventListener
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.jstasks.HeadlessJsTaskConfig
import com.facebook.react.jstasks.HeadlessJsTaskContext
import com.facebook.react.jstasks.HeadlessJsTaskEventListener

/**
 * Runs the JS side of the channel sync while the app is closed.
 *
 * The refresh has to happen in JS: the listings are HTML behind a proof-of-work
 * interstitial, a hand-rolled cookie jar and runtime mirror selection, all of which
 * live in the bundle. Rather than reimplement any of that natively, this brings up a
 * headless JS runtime and hands it the `TvChannelsSync` task, which publishes
 * through the same module the foreground sync uses.
 *
 * It deliberately does not subclass `HeadlessJsTaskService`: that is a `Service`,
 * and starting one from a job runs into the background service start limits added in
 * Android 8.0. Driving `HeadlessJsTaskContext` from the job itself sidesteps that,
 * and lets `jobFinished` wait for the JS task to actually finish instead of
 * reporting the job done the moment the task is handed off.
 */
class TvChannelsSyncJobService : JobService(), HeadlessJsTaskEventListener {
  private var jobParams: JobParameters? = null
  private var taskContext: HeadlessJsTaskContext? = null
  private var runningTaskId: Int? = null

  companion object {
    /** Must match the name the JS side registers with `AppRegistry.registerHeadlessTask`. */
    private const val TASK_KEY = "TvChannelsSync"

    /**
     * JobScheduler gives a job 10 minutes. The sync fetches one page per home tab,
     * so this leaves room for a slow provider while still releasing the wake lock
     * well before the system kills the job outright.
     */
    private const val TASK_TIMEOUT_MS = 5L * 60 * 1000
  }

  override fun onStartJob(params: JobParameters): Boolean {
    jobParams = params

    val reactHost = (application as? ReactApplication)?.reactHost ?: return false
    val reactContext = reactHost.currentReactContext

    if (reactContext != null) {
      startTask(reactContext)

      return true
    }

    // the app is not running, so a JS runtime has to be started before the task can
    // be handed over
    reactHost.addReactInstanceEventListener(object : ReactInstanceEventListener {
      override fun onReactContextInitialized(context: ReactContext) {
        reactHost.removeReactInstanceEventListener(this)
        startTask(context)
      }
    })
    reactHost.start()

    return true
  }

  override fun onStopJob(params: JobParameters): Boolean {
    releaseTask()

    // the sync was cut short (network lost, the system reclaimed the slot), so ask
    // for it to be run again rather than waiting out the whole period
    return true
  }

  override fun onHeadlessJsTaskStart(taskId: Int) = Unit

  override fun onHeadlessJsTaskFinish(taskId: Int) {
    if (taskId != runningTaskId) {
      return
    }

    val params = jobParams

    releaseTask()

    if (params != null) {
      jobFinished(params, false)
    }
  }

  private fun startTask(reactContext: ReactContext) {
    val context = HeadlessJsTaskContext.getInstance(reactContext)

    taskContext = context
    context.addTaskEventListener(this)

    // `startTask` has to run on the UI thread, and the react instance callback above
    // does not promise one
    UiThreadUtil.runOnUiThread {
      runningTaskId = context.startTask(
        HeadlessJsTaskConfig(
          TASK_KEY,
          Arguments.createMap(),
          TASK_TIMEOUT_MS,
          // the job can fire while the app happens to be open; without this the task
          // would be rejected and the job would never report itself finished
          true
        )
      )
    }
  }

  private fun releaseTask() {
    taskContext?.removeTaskEventListener(this)
    taskContext = null
    runningTaskId = null
    jobParams = null
  }
}
