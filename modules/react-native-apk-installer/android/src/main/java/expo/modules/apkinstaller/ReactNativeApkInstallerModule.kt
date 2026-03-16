package expo.modules.apkinstaller

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.Promise
import java.io.File
import android.os.Build
import android.net.Uri
import androidx.core.content.FileProvider
import android.content.Intent
import android.provider.Settings
import android.app.Activity

class ReactNativeApkInstallerModule : Module() {
  private var mPromise: Promise? = null

  companion object {
    private const val REQUEST_SETTING_CODE = 6101
  }

  override fun definition() = ModuleDefinition {
    Name("ReactNativeApkInstaller")

    AsyncFunction("install") { filePath: String, promise: Promise ->
      val apkFile = File(filePath)
      if (!apkFile.exists()) {
        promise.reject("101", "file not exist. $filePath", null)
        return@AsyncFunction
      }

      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
        val authority = appContext.reactContext?.packageName + ".fileprovider"
        val contentUri: Uri = try {
          FileProvider.getUriForFile(appContext.reactContext!!, authority, apkFile)
        } catch (e: Exception) {
          promise.reject("102", "installApk exception with authority name '$authority'", null)
          return@AsyncFunction
        }
        val installApp = Intent(Intent.ACTION_INSTALL_PACKAGE)
        installApp.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        installApp.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        installApp.setData(contentUri)
        installApp.putExtra(Intent.EXTRA_INSTALLER_PACKAGE_NAME, appContext.reactContext?.applicationInfo?.packageName)
        appContext.reactContext?.startActivity(installApp)
      } else {
        // Old APIs do not handle content:// URIs, so use an old file:// style
        val cmd = "chmod 777 $apkFile"
        try {
          Runtime.getRuntime().exec(cmd)
        } catch (e: Exception) {
          e.printStackTrace()
        }
        val intent = Intent(Intent.ACTION_VIEW)
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        intent.setDataAndType(Uri.parse("file://$apkFile"), "application/vnd.android.package-archive")
        appContext.reactContext?.startActivity(intent)
      }
      promise.resolve(true)
    }

    AsyncFunction("haveUnknownAppSourcesPermission") { promise: Promise ->
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
        promise.resolve(Build.VERSION.SDK_INT)
        return@AsyncFunction
      }
      promise.resolve(appContext.reactContext?.packageManager?.canRequestPackageInstalls())
    }

    AsyncFunction("showUnknownAppSourcesPermission") { promise: Promise ->
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
        promise.resolve(Build.VERSION.SDK_INT)
        return@AsyncFunction
      }
      mPromise = promise
      try {
        val packageURI = Uri.parse("package:" + appContext.reactContext?.packageName)
        val intent = Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES, packageURI)
        appContext.activityProvider?.currentActivity?.startActivityForResult(intent, REQUEST_SETTING_CODE)
      } catch (e: Exception) {
        promise.reject("101", "START_ACTIVITY_ERROR", null)
        mPromise = null
      }
    }

    OnActivityResult { _, result ->
      if (result.resultCode == Activity.RESULT_OK && result.requestCode == REQUEST_SETTING_CODE && mPromise != null) {
        mPromise?.resolve(true)
        mPromise = null
      }
    }
  }
}
