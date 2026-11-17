package expo.modules.torrent

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Notification
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import android.util.Base64
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import org.json.JSONObject
import java.io.File
import java.net.HttpURLConnection
import java.net.InetAddress
import java.net.ServerSocket
import java.net.URL
import java.util.UUID

internal object TorrentRuntime {
  private var process: Process? = null
  private var connection: Map<String, Any>? = null

  @Synchronized fun start(context: Context): Map<String, Any> {
    connection?.let { if (process?.isAlive == true) return it }
    val binary = File(context.applicationInfo.nativeLibraryDir, "libtorrserver.so")
    check(binary.isFile) { "Torrent engine is missing from this Android build" }
    val directory = File(context.cacheDir, "lumen-torrent-runtime").apply { mkdirs() }
    val password = UUID.randomUUID().toString()
    File(directory, "accs.db").writeText(JSONObject().put("lumen", password).toString())
    val port = ServerSocket(0, 0, InetAddress.getByName("127.0.0.1")).use { it.localPort }
    val base = "http://127.0.0.1:$port"
    val authorization = "Basic " + Base64.encodeToString("lumen:$password".toByteArray(), Base64.NO_WRAP)
    val settings = JSONObject().put("CacheSize", 64 * 1024 * 1024).put("UseDisk", false)
      .put("RemoveCacheOnDrop", true).put("TorrentDisconnectTimeout", 30)
      .put("ConnectionsLimit", 16).put("PreloadCache", 10).put("ReaderReadAHead", 50)
      .put("EnableDLNA", false).put("EnableBonjour", false).put("EnableLPD", false)
      .put("DisableUPNP", true).put("EnableDebug", false)
      .put("ResponsiveMode", true)
    File(directory, "settings.json").writeText(JSONObject().put("BitTorr", settings).toString())
    val intent = Intent(context, LumenTorrentService::class.java)
    if (Build.VERSION.SDK_INT >= 26) context.startForegroundService(intent) else context.startService(intent)
    try {
      val builder = ProcessBuilder(binary.absolutePath, "--ip", "127.0.0.1", "--port", port.toString(),
        "--path", directory.absolutePath, "--httpauth")
      builder.environment()["GOMEMLIMIT"] = "160MiB"
      builder.redirectOutput(File("/dev/null")).redirectError(File("/dev/null"))
      process = builder.start()
      for (attempt in 0 until 100) {
        check(process?.isAlive == true) { "Torrent engine stopped" }
        try {
          val response = (URL("$base/echo").openConnection() as HttpURLConnection).apply {
            connectTimeout = 500; readTimeout = 500; setRequestProperty("Authorization", authorization)
          }
          val ready = try { response.responseCode == 200 } finally { response.disconnect() }
          if (ready) {
            return mapOf<String, Any>("baseUrl" to base, "authorization" to authorization, "hls" to false)
              .also { connection = it }
          }
        } catch (_: java.io.IOException) { }
        Thread.sleep(150)
      }
      error("Torrent engine startup timeout")
    } catch (error: Exception) {
      stop(); context.stopService(intent); throw error
    }
  }
  @Synchronized fun stop() {
    process?.destroy()
    process = null
    connection = null
  }
}

class LumenTorrentService : Service() {
  override fun onCreate() {
    super.onCreate()
    val channel = "lumen-torrent"
    val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    if (Build.VERSION.SDK_INT >= 26) {
      manager.createNotificationChannel(NotificationChannel(channel, "Lumen", NotificationManager.IMPORTANCE_LOW))
    }
    val notification = if (Build.VERSION.SDK_INT >= 26) Notification.Builder(this, channel) else Notification.Builder(this)
    startForeground(3172, notification.setContentTitle("Lumen • BitTorrent")
      .setSmallIcon(applicationInfo.icon).setOngoing(true).build())
  }
  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int = START_NOT_STICKY
  override fun onBind(intent: Intent?): IBinder? = null
  override fun onTaskRemoved(rootIntent: Intent?) { TorrentRuntime.stop(); stopSelf() }
  override fun onDestroy() { TorrentRuntime.stop(); super.onDestroy() }
}

class LumenTorrentModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("LumenTorrent")
    AsyncFunction("start") {
      val context = appContext.reactContext ?: error("Android context unavailable")
      TorrentRuntime.start(context)
    }
    AsyncFunction("stop") {
      TorrentRuntime.stop()
      appContext.reactContext?.let { it.stopService(Intent(it, LumenTorrentService::class.java)) }
    }
    OnDestroy {
      TorrentRuntime.stop()
      appContext.reactContext?.let { it.stopService(Intent(it, LumenTorrentService::class.java)) }
    }
  }
}
