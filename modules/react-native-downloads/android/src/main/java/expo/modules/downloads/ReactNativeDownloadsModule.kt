package expo.modules.downloads

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.Promise
import android.os.Environment
import android.os.storage.StorageManager
import android.content.Context
import java.io.File
import java.net.URL
import java.util.UUID
import java.util.concurrent.ConcurrentHashMap

class ReactNativeDownloadsModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ReactNativeDownloads")

    Function("getDownloadsDirectories") {
      val context = appContext.reactContext ?: throw Exception("React context is not available")
      val result = mutableListOf<Map<String, Any>>()

      val dirs = context.getExternalFilesDirs(null)

      dirs.forEach { file: File? ->
        file?.let { it: File ->
          val rootPath = it.absolutePath.substringBefore("/Android/")
          val isRemovable = Environment.isExternalStorageRemovable(it)
          val isPrimary = Environment.isExternalStorageEmulated(it)

          result.add(
            mapOf(
              "rootPath" to rootPath,
              "downloadsPath" to "$rootPath/${Environment.DIRECTORY_DOWNLOADS}",
              "isRemovable" to isRemovable,
              "isPrimary" to isPrimary
            )
          )
        }
      }

      result
    }
  }
}
