package expo.modules.tvchannels

import android.app.job.JobInfo
import android.app.job.JobScheduler
import android.content.ComponentName
import android.content.Context

/**
 * Owns the JobScheduler entries that drive [TvChannelsSyncJobService]. Both the
 * module (when the feature is switched on) and the install-time broadcast receiver
 * schedule through here.
 */
internal object TvChannelsSyncScheduler {
  private const val PERIODIC_JOB_ID = 7311
  private const val ONE_SHOT_JOB_ID = 7312

  /** JobScheduler clamps anything shorter, and a clamped period breaks the check in [schedulePeriodic]. */
  private const val MIN_INTERVAL_MINUTES = 15L

  /**
   * Keeps a periodic sync registered.
   *
   * Re-scheduling an existing job restarts its period, so an app that is opened
   * regularly would push the job back indefinitely and it would never run. An
   * already registered job with the same period is therefore left alone.
   *
   * @return whether the job had to be (re)scheduled.
   */
  fun schedulePeriodic(context: Context, intervalMinutes: Int): Boolean {
    val scheduler = context.jobScheduler ?: return false
    val intervalMillis = maxOf(intervalMinutes.toLong(), MIN_INTERVAL_MINUTES) * 60 * 1000

    if (scheduler.getPendingJob(PERIODIC_JOB_ID)?.intervalMillis == intervalMillis) {
      return false
    }

    val jobInfo = JobInfo.Builder(PERIODIC_JOB_ID, componentName(context))
      .setRequiredNetworkType(JobInfo.NETWORK_TYPE_ANY)
      // the listings are fetched over the network anyway, and a TV box is mains
      // powered, so there is nothing to gain from waiting for idle or charging
      .setPersisted(true)
      .setPeriodic(intervalMillis)
      .build()

    return scheduler.schedule(jobInfo) == JobScheduler.RESULT_SUCCESS
  }

  /** Runs a sync as soon as the device has a network, once. */
  fun scheduleOnce(context: Context): Boolean {
    val scheduler = context.jobScheduler ?: return false

    val jobInfo = JobInfo.Builder(ONE_SHOT_JOB_ID, componentName(context))
      .setRequiredNetworkType(JobInfo.NETWORK_TYPE_ANY)
      .setOverrideDeadline(0)
      .build()

    return scheduler.schedule(jobInfo) == JobScheduler.RESULT_SUCCESS
  }

  fun cancel(context: Context) {
    val scheduler = context.jobScheduler ?: return

    scheduler.cancel(PERIODIC_JOB_ID)
    scheduler.cancel(ONE_SHOT_JOB_ID)
  }

  private fun componentName(context: Context) =
    ComponentName(context, TvChannelsSyncJobService::class.java)

  private val Context.jobScheduler: JobScheduler?
    get() = getSystemService(Context.JOB_SCHEDULER_SERVICE) as? JobScheduler
}
