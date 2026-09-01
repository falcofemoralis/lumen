'use strict';

/**
 * Drops native libraries the app links but never executes.
 *
 * Every .so is stored in the APK for each ABI we ship, so a decoder nobody calls
 * is paid for four times over. Three of them are dead weight here:
 *
 * - Fresco's GIF and WebP decoders (libgifimage.so, libstatic-webp.so).
 *   Fresco only ever backs React Native's own <Image>, and
 *   every <Image> in this app is handed a `require(...)` of a local PNG - avatars,
 *   QR codes, the app icon. Remote images all go through expo-image, which decodes
 *   through Glide and does not touch Fresco. `expo.gif.enabled` and
 *   `expo.webp.enabled` are read by RN's own gradle plugin, which is what pulls
 *   the `com.facebook.fresco:animated-gif` / `:webpsupport` artifacts in.
 *
 *   Careful: that makes this a tripwire. If `expo/fetch` ever moves into
 *   production code, its interceptor advertises `Accept-Encoding: zstd` on every
 *   request, and the first server that takes it up on the offer throws
 *   UnsatisfiedLinkError. Remove the exclusion below before shipping any
 *   non-__DEV__ use of `expo/fetch`.
 *
 * Note that libavif_android.so and libanimation-decoder-gif.so deliberately survive.
 * Both belong to expo-image rather than to React Native: expo-image pulls
 * `com.github.penfeizhou.android.animation:glide-plugin` for APNG and animated WebP,
 * and that drags in its `avif` and `gif` siblings. AVIF additionally arrives via
 * Glide's own `avif-integration`, so excluding one path does not drop the .so anyway.
 *
 * Neither can be excluded safely: glide-plugin's ByteBufferAnimationDecoder,
 * StreamAnimationDecoder and FrameDrawableTranscoder hard-reference AVIFParser,
 * AVIFDecoder and the GIF equivalents on the ordinary decode path, so removing the
 * artifacts leaves those references dangling and breaks image loading generally,
 * not just for the format being dropped. libanimation-decoder-gif.so is also what
 * actually renders animated GIFs in <ThemedImage>, unlike Fresco's libgifimage.so
 * above, which nothing here reaches.
 *
 * `expo prebuild --clean` regenerates android/, so this has to be a config plugin
 * instead of an edit to android/gradle.properties. Nothing here needs to touch
 * app/build.gradle: the Expo template already folds
 * `android.packagingOptions.excludes` into the android block for us.
 */

const { withGradleProperties } = require('@expo/config-plugins');

const PROPERTIES = {
  'expo.gif.enabled': 'false',
  'expo.webp.enabled': 'false',
};

const withTrimmedNativeLibs = (config) => withGradleProperties(config, (modConfig) => {
  const overridden = new Set();

  // The template already declares expo.gif.enabled and expo.webp.enabled, so
  // these are usually overwrites rather than additions.
  const properties = modConfig.modResults.map((item) => {
    if (item.type !== 'property' || !Object.hasOwn(PROPERTIES, item.key)) {
      return item;
    }

    overridden.add(item.key);

    return { ...item, value: PROPERTIES[item.key] };
  });

  Object.entries(PROPERTIES).forEach(([key, value]) => {
    if (overridden.has(key)) {
      return;
    }

    properties.push({ type: 'property', key, value });
  });

  return { ...modConfig, modResults: properties };
});

module.exports = withTrimmedNativeLibs;
