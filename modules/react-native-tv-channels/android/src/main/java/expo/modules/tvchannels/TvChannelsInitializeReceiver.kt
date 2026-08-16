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
 * On a fresh install this queues a job that does nothing and stops there: the broadcast
 * arrives before the app has ever run, so the config the JS task reads is still all
 * defaults - including `isTV`, which is only known once the app has started - and the
 * task bails. After an update, where that config exists, the sync actually runs.
 */
class TvChannelsInitializeReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    if (intent.action != TvContractCompat.ACTION_INITIALIZE_PROGRAMS) {
      return
    }

    TvChannelsSyncScheduler.scheduleOnce(context.applicationContext)
  }
}
