export interface UpdateInterface {
  versionName: string;
  description: string;
  /**
   * Universal APK. Stays the fallback for devices whose architecture is missing
   * from `downloadAndroidUrls` and for clients released before per-ABI updates,
   * which only know this field.
   */
  downloadAndroidUrl: string;
  /** Per-architecture APKs, keyed by Android ABI ('arm64-v8a', 'armeabi-v7a', ...). */
  downloadAndroidUrls?: Record<string, string>;
}
