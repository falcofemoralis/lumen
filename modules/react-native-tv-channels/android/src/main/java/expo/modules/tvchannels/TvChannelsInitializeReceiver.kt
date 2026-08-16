package expo.modules.tvchannels

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import androidx.tvprovider.media.tv.TvContractCompat

/**
 * The launcher broadcasts INITIALIZE_PROGRAMS once after the app is installed or
 * updated, asking it to populate its channels. Nothing can be fetched from a
 * receiver, so this just queues a one-shot sync job.
 *
 * The JS task bails out when the feature is switched off, so a fresh install (where
 * it defaults to off) queues a job that does nothing and stops there.
 */
class TvChannelsInitializeReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    if (intent.action != TvContractCompat.ACTION_INITIALIZE_PROGRAMS) {
      return
    }

    TvChannelsSyncScheduler.scheduleOnce(context.applicationContext)
  }
}
