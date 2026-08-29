package expo.modules.tvchannels

import android.app.Activity
import android.app.UiModeManager
import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.content.res.Configuration
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.drawable.BitmapDrawable
import android.graphics.drawable.Drawable
import android.net.Uri
import android.os.Build
import android.provider.BaseColumns
import androidx.tvprovider.media.tv.PreviewChannel
import androidx.tvprovider.media.tv.PreviewChannelHelper
import androidx.tvprovider.media.tv.PreviewProgram
import androidx.tvprovider.media.tv.TvContractCompat
import androidx.tvprovider.media.tv.TvContractCompat.PreviewProgramColumns
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * Publishes "recommendations channels" (preview channels) on the Android TV home
 * screen, following https://developer.android.com/training/tv/discovery/recommendations-channel
 *
 * A channel is addressed by its `providerId` (stored as the channel's
 * INTERNAL_PROVIDER_ID) rather than by the row id the TvProvider hands out, so JS
 * never has to persist anything: the row ids are looked up again on every sync.
 *
 * Only Android 8.0+ TV devices have the TvProvider; everywhere else `isSupported`
 * returns false and the sync functions are no-ops instead of throwing, so callers
 * do not have to branch on the platform.
 *
 * NOTE: channels are read straight from the provider rather than through
 * `PreviewChannelHelper`. Its read paths (`getAllChannels`, `getPreviewChannel` and
 * `updatePreviewChannel`, which reads the channel back before writing) all go
 * through `PreviewChannel.fromCursor`, which addresses columns by fixed index and
 * hands the result to `Builder.setDisplayName`, which calls `toString()` on it
 * unguarded - so a single row with a null display name throws an NPE and takes the
 * whole sync with it. Its projection also leaves out COLUMN_BROWSABLE, which makes
 * `PreviewChannel.isBrowsable()` report false for every channel. The helper is
 * still used for writes, where neither problem applies.
 */
class ReactNativeTvChannelsModule : Module() {
  private var browsablePromise: Promise? = null

  /** A channel row as this module reads it, see the note on the class. */
  private data class PublishedChannel(
    val id: Long,
    val providerId: String?,
    val displayName: String?,
    val isBrowsable: Boolean
  )

  companion object {
    private const val REQUEST_BROWSABLE_CODE = 7301

    private const val ERROR_UNSUPPORTED = "ERR_TV_CHANNELS_UNSUPPORTED"
    private const val ERROR_SYNC = "ERR_TV_CHANNELS_SYNC"
    private const val ERROR_NO_ACTIVITY = "ERR_TV_CHANNELS_NO_ACTIVITY"

    /** `PreviewChannelHelper` returns this when the provider refused the insert. */
    private const val INVALID_CHANNEL_ID = -1L

    /** Channel logos are shown under a circular mask at 80dp x 80dp. */
    private const val LOGO_SIZE_PX = 320

    private val CHANNEL_PROJECTION = arrayOf(
      BaseColumns._ID,
      TvContractCompat.BaseTvColumns.COLUMN_PACKAGE_NAME,
      TvContractCompat.Channels.COLUMN_INTERNAL_PROVIDER_ID,
      TvContractCompat.Channels.COLUMN_DISPLAY_NAME,
      TvContractCompat.Channels.COLUMN_BROWSABLE
    )

    private const val CHANNEL_COL_ID = 0
    private const val CHANNEL_COL_PACKAGE_NAME = 1
    private const val CHANNEL_COL_INTERNAL_PROVIDER_ID = 2
    private const val CHANNEL_COL_DISPLAY_NAME = 3
    private const val CHANNEL_COL_BROWSABLE = 4
  }

  override fun definition() = ModuleDefinition {
    Name("ReactNativeTvChannels")

    Function("isSupported") {
      isSupported()
    }

    AsyncFunction("getChannels") { promise: Promise ->
      if (!isSupported()) {
        promise.resolve(emptyList<Map<String, Any?>>())

        return@AsyncFunction
      }

      try {
        promise.resolve(readChannels().map { it.toJsMap() })
      } catch (e: Exception) {
        promise.reject(ERROR_SYNC, "Failed to read the published channels: ${e.describe()}", e)
      }
    }

    /**
     * Creates the channels that are missing, updates the ones that already exist and
     * replaces their programs. Channels are matched by `providerId`, so the same call
     * can be repeated on every app start.
     */
    AsyncFunction("syncChannels") { channels: List<TvChannelSpec>, promise: Promise ->
      if (!isSupported()) {
        promise.resolve(emptyList<Map<String, Any?>>())

        return@AsyncFunction
      }

      try {
        val helper = PreviewChannelHelper(context)
        val existing = readChannels()
        // publishing the first channel of an app is what makes it the default
        // (auto-browsable) one, and that has to be decided against the state before
        // this batch started inserting
        val hadChannels = existing.isNotEmpty()

        channels.forEachIndexed { index, spec ->
          syncChannel(
            helper = helper,
            spec = spec,
            existing = existing.firstOrNull { it.providerId == spec.providerId },
            isDefaultCandidate = !hadChannels && index == 0
          )
        }

        // re-read so the reported browsable state covers the default channel that
        // just became visible, and so the row ids are the ones actually stored
        val published = readChannels().associateBy { it.providerId }

        promise.resolve(channels.mapNotNull { published[it.providerId]?.toJsMap() })
      } catch (e: Exception) {
        promise.reject(ERROR_SYNC, "Failed to sync the channels: ${e.describe()}", e)
      }
    }

    /** Removes every channel this app published whose `providerId` is not in [keep]. */
    AsyncFunction("deleteChannelsExcept") { keep: List<String>, promise: Promise ->
      if (!isSupported()) {
        promise.resolve(0)

        return@AsyncFunction
      }

      try {
        val helper = PreviewChannelHelper(context)
        // a channel without a provider id was not published by this module
        val removed = readChannels().filter { it.providerId != null && it.providerId !in keep }

        removed.forEach { helper.deletePreviewChannel(it.id) }

        promise.resolve(removed.size)
      } catch (e: Exception) {
        promise.reject(ERROR_SYNC, "Failed to delete the channels: ${e.describe()}", e)
      }
    }

    /**
     * Registers the periodic background sync, which runs the JS `TvChannelsSync`
     * task with no UI. Cheap to call on every start - an already registered job with
     * the same interval is left running rather than restarted.
     */
    AsyncFunction("scheduleBackgroundSync") { intervalMinutes: Int, promise: Promise ->
      if (!isSupported()) {
        promise.resolve(false)

        return@AsyncFunction
      }

      try {
        promise.resolve(TvChannelsSyncScheduler.schedulePeriodic(context, intervalMinutes))
      } catch (e: Exception) {
        promise.reject(ERROR_SYNC, "Failed to schedule the background sync: ${e.describe()}", e)
      }
    }

    AsyncFunction("cancelBackgroundSync") { promise: Promise ->
      if (!isSupported()) {
        promise.resolve(false)

        return@AsyncFunction
      }

      try {
        TvChannelsSyncScheduler.cancel(context)
        promise.resolve(true)
      } catch (e: Exception) {
        promise.reject(ERROR_SYNC, "Failed to cancel the background sync: ${e.describe()}", e)
      }
    }

    /**
     * Asks the system to show a channel on the home screen. The launcher puts up a
     * confirmation dialog, so this may only be called while the app is in the
     * foreground, and only one dialog can be in flight at a time.
     */
    AsyncFunction("requestChannelBrowsable") { channelId: Double, promise: Promise ->
      if (!isSupported()) {
        promise.reject(ERROR_UNSUPPORTED, "Preview channels require Android 8.0 on a TV device", null)

        return@AsyncFunction
      }

      val activity = appContext.activityProvider?.currentActivity

      if (activity == null) {
        promise.reject(ERROR_NO_ACTIVITY, "The app has to be in the foreground to add a channel", null)

        return@AsyncFunction
      }

      // a second dialog cannot be shown while the first one is up, and leaving the
      // previous promise unsettled would hang the caller forever
      browsablePromise?.resolve(false)
      browsablePromise = promise

      val intent = Intent(TvContractCompat.ACTION_REQUEST_CHANNEL_BROWSABLE)
      intent.putExtra(TvContractCompat.EXTRA_CHANNEL_ID, channelId.toLong())

      try {
        activity.startActivityForResult(intent, REQUEST_BROWSABLE_CODE)
      } catch (e: ActivityNotFoundException) {
        browsablePromise = null
        promise.reject(ERROR_UNSUPPORTED, "This device has no launcher handling preview channels", e)
      }
    }

    OnActivityResult { _, result ->
      if (result.requestCode == REQUEST_BROWSABLE_CODE) {
        browsablePromise?.resolve(result.resultCode == Activity.RESULT_OK)
        browsablePromise = null
      }
    }
  }

  private val context: Context
    get() = requireNotNull(appContext.reactContext) { "React context is not available" }

  /**
   * Preview channels were added in Android 8.0 and only exist on devices shipping the
   * TvProvider, which in practice means devices running the leanback (TV) UI.
   */
  private fun isSupported(): Boolean {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
      return false
    }

    val reactContext = appContext.reactContext ?: return false
    val packageManager = reactContext.packageManager

    if (packageManager.hasSystemFeature(PackageManager.FEATURE_LEANBACK)) {
      return true
    }

    val uiModeManager = reactContext.getSystemService(Context.UI_MODE_SERVICE) as? UiModeManager

    return uiModeManager?.currentModeType == Configuration.UI_MODE_TYPE_TELEVISION
  }

  /** Every channel belonging to this app, read defensively - see the note on the class. */
  private fun readChannels(): List<PublishedChannel> {
    val packageName = context.packageName
    val channels = mutableListOf<PublishedChannel>()

    context.contentResolver.query(
      TvContractCompat.Channels.CONTENT_URI,
      CHANNEL_PROJECTION,
      null,
      null,
      null
    )?.use { cursor ->
      while (cursor.moveToNext()) {
        // the provider is expected to scope this query to the calling app already,
        // but a foreign row slipping through would be updated or deleted by a sync
        val rowPackage = cursor.getStringOrNull(CHANNEL_COL_PACKAGE_NAME)

        if (rowPackage != null && rowPackage != packageName) {
          continue
        }

        channels.add(
          PublishedChannel(
            id = cursor.getLong(CHANNEL_COL_ID),
            providerId = cursor.getStringOrNull(CHANNEL_COL_INTERNAL_PROVIDER_ID),
            displayName = cursor.getStringOrNull(CHANNEL_COL_DISPLAY_NAME),
            isBrowsable = !cursor.isNull(CHANNEL_COL_BROWSABLE) && cursor.getInt(CHANNEL_COL_BROWSABLE) == 1
          )
        )
      }
    }

    return channels
  }

  private fun syncChannel(
    helper: PreviewChannelHelper,
    spec: TvChannelSpec,
    existing: PublishedChannel?,
    isDefaultCandidate: Boolean
  ) {
    val channelId = if (existing == null) {
      // a logo is mandatory on insert - PreviewChannelHelper rolls the channel back
      // and throws when it cannot store one
      val channel = buildChannel(spec, withLogo = true)

      if (isDefaultCandidate) {
        // the very first channel an app publishes may be shown without asking the user
        helper.publishDefaultChannel(channel)
      } else {
        helper.publishChannel(channel)
      }
    } else {
      // the logo is deliberately left out: re-sending it would make every sync
      // re-upload (and for a remote uri re-download) an image that has not changed
      context.contentResolver.update(
        TvContractCompat.buildChannelUri(existing.id),
        buildChannel(spec, withLogo = false).toContentValues(),
        null,
        null
      )

      existing.id
    }

    if (channelId == INVALID_CHANNEL_ID) {
      return
    }

    syncPrograms(helper, channelId, spec.programs)
  }

  private fun buildChannel(spec: TvChannelSpec, withLogo: Boolean): PreviewChannel {
    val builder = PreviewChannel.Builder()
      .setDisplayName(spec.displayName)
      .setInternalProviderId(spec.providerId)

    spec.description?.let { builder.setDescription(it) }
    spec.appLinkIntentUri?.let { builder.setAppLinkIntentUri(Uri.parse(it)) }

    if (withLogo) {
      val logoUri = spec.logoUri

      if (logoUri != null) {
        builder.setLogo(Uri.parse(logoUri))
      } else {
        builder.setLogo(appIconBitmap())
      }
    }

    return builder.build()
  }

  /**
   * Brings the channel's programs in line with [programs], keyed by `providerId`:
   * known ones are updated in place (the launcher keeps their position and cached
   * artwork), new ones are inserted and the ones that dropped out are deleted.
   */
  private fun syncPrograms(helper: PreviewChannelHelper, channelId: Long, programs: List<TvProgramSpec>) {
    val existing = readPrograms(channelId)
    val published = mutableSetOf<String>()

    programs.forEachIndexed { index, spec ->
      // the launcher orders programs by descending weight, so the first spec wins
      val program = buildProgram(channelId, spec, weight = programs.size - index)
      val current = existing[spec.providerId]

      if (current == null) {
        helper.publishPreviewProgram(program)
      } else {
        helper.updatePreviewProgram(current, program)
      }

      published.add(spec.providerId)
    }

    existing.forEach { (providerId, programId) ->
      if (providerId !in published) {
        helper.deletePreviewProgram(programId)
      }
    }
  }

  /**
   * Maps the channel's currently published programs from `providerId` to row id.
   * `PreviewProgram.fromCursor` looks columns up by name and null-checks each one,
   * so unlike the channel side it is safe to use here.
   */
  private fun readPrograms(channelId: Long): Map<String, Long> {
    val programs = mutableMapOf<String, Long>()

    // a WHERE clause would be rejected by the TvProvider, the channel is selected
    // through the uri instead
    context.contentResolver.query(
      TvContractCompat.buildPreviewProgramsUriForChannel(channelId),
      null,
      null,
      null,
      null
    )?.use { cursor ->
      while (cursor.moveToNext()) {
        val program = PreviewProgram.fromCursor(cursor)
        val providerId = program.internalProviderId

        if (providerId != null) {
          programs[providerId] = program.id
        }
      }
    }

    return programs
  }

  private fun buildProgram(channelId: Long, spec: TvProgramSpec, weight: Int): PreviewProgram {
    val builder = PreviewProgram.Builder()
      .setChannelId(channelId)
      .setInternalProviderId(spec.providerId)
      .setType(programType(spec.type))
      .setTitle(spec.title)
      .setIntentUri(Uri.parse(spec.intentUri))
      .setPosterArtAspectRatio(aspectRatio(spec.posterArtAspectRatio))
      .setWeight(weight)

    spec.description?.let { builder.setDescription(it) }
    spec.posterArtUri?.let { builder.setPosterArtUri(Uri.parse(it)) }
    spec.releaseDate?.let { builder.setReleaseDate(it) }
    spec.genre?.let { builder.setGenre(it) }

    if (spec.live) {
      builder.setLive(true)
    }

    return builder.build()
  }

  private fun programType(type: String?): Int = when (type) {
    "tv_series" -> PreviewProgramColumns.TYPE_TV_SERIES
    "tv_episode" -> PreviewProgramColumns.TYPE_TV_EPISODE
    "clip" -> PreviewProgramColumns.TYPE_CLIP
    else -> PreviewProgramColumns.TYPE_MOVIE
  }

  private fun aspectRatio(ratio: String?): Int = when (ratio) {
    "16_9" -> PreviewProgramColumns.ASPECT_RATIO_16_9
    "3_2" -> PreviewProgramColumns.ASPECT_RATIO_3_2
    "4_3" -> PreviewProgramColumns.ASPECT_RATIO_4_3
    "1_1" -> PreviewProgramColumns.ASPECT_RATIO_1_1
    "2_3" -> PreviewProgramColumns.ASPECT_RATIO_2_3
    else -> PreviewProgramColumns.ASPECT_RATIO_MOVIE_POSTER
  }

  /** Fallback channel logo, so a channel can always be published without shipping an asset. */
  private fun appIconBitmap(): Bitmap {
    val icon: Drawable = context.packageManager.getApplicationIcon(context.packageName)

    if (icon is BitmapDrawable && icon.bitmap != null) {
      return icon.bitmap
    }

    // adaptive icons have no backing bitmap and have to be rasterized
    val bitmap = Bitmap.createBitmap(LOGO_SIZE_PX, LOGO_SIZE_PX, Bitmap.Config.ARGB_8888)
    val canvas = Canvas(bitmap)

    icon.setBounds(0, 0, canvas.width, canvas.height)
    icon.draw(canvas)

    return bitmap
  }

  private fun android.database.Cursor.getStringOrNull(index: Int): String? =
    if (isNull(index)) null else getString(index)

  /** Bare messages like "null" say nothing on the JS side, the type usually does. */
  private fun Exception.describe(): String = "${this::class.java.simpleName}: ${message ?: "no message"}"

  private fun PublishedChannel.toJsMap(): Map<String, Any?> = mapOf(
    "id" to id.toDouble(),
    "providerId" to providerId,
    "displayName" to displayName,
    "isBrowsable" to isBrowsable
  )
}
