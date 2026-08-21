import * as Device from 'expo-device';
import { UpdateInterface } from 'Type/Update.interface';

/**
 * Picks the update APK matching the device's CPU architecture.
 *
 * The release build ships one APK per ABI plus a universal one, and an update
 * only needs a matching package name and signature - not a matching ABI - so a
 * per-architecture APK installs over any previous build while downloading a
 * fraction of the bytes.
 *
 * `Device.supportedCpuArchitectures` is Build.SUPPORTED_ABIS, ordered most
 * capable first, so the first entry we published an APK for is the right one:
 * a 64-bit device takes arm64-v8a over armeabi-v7a, and an x86 box that can
 * emulate arm still prefers its native x86 build.
 */
export const getAndroidDownloadUrl = (update: UpdateInterface): string => {
  const { downloadAndroidUrl, downloadAndroidUrls } = update;

  if (!downloadAndroidUrls) {
    return downloadAndroidUrl;
  }

  const abi = (Device.supportedCpuArchitectures ?? []).find(
    (architecture) => downloadAndroidUrls[architecture]
  );

  // an unknown architecture falls back to the universal APK rather than to
  // nothing, so an unexpected device can still update
  return abi ? downloadAndroidUrls[abi] : downloadAndroidUrl;
};
