'use strict';

/**
 * Splits the release APK per CPU architecture.
 *
 * A single APK ships the native libraries (hermes, reanimated, video, mmkv,
 * nitro, svg, ...) for every ABI listed in `reactNativeArchitectures`, so a
 * device downloads ~4x the .so payload it can actually run. Enabling ABI splits
 * makes Gradle emit one APK per architecture plus - when `universalApk` is on -
 * the fat one we build today as a fallback for anyone who does not know their
 * device's architecture.
 *
 * `expo prebuild --clean` regenerates android/, so this has to be a config
 * plugin instead of an edit to android/app/build.gradle.
 *
 * Note: every split keeps the same versionCode. That is fine for sideloading
 * (a device only ever sees one of them), but a store listing that carries all
 * of them at once would need distinct codes per ABI.
 */

const { withAppBuildGradle } = require('@expo/config-plugins');

const GENERATED_MARKER = '// @generated withAbiSplits';
const DEFAULT_ABIS = ['armeabi-v7a', 'arm64-v8a', 'x86', 'x86_64'];

const withAbiSplits = (
  config,
  { abis = DEFAULT_ABIS, universalApk = true } = {}
) => withAppBuildGradle(config, (modConfig) => {
  if (modConfig.modResults.language !== 'groovy') {
    throw new Error(
      `[withAbiSplits] Expected a groovy build.gradle, got "${modConfig.modResults.language}".`
    );
  }

  const contents = modConfig.modResults.contents;

  if (contents.includes(GENERATED_MARKER)) {
    return modConfig;
  }

  // The root-level `android {` block - anchored to the start of a line so it
  // cannot match `androidResources {` or a nested block.
  const androidBlock = /^android\s*\{[^\n]*\n/m;

  if (!androidBlock.test(contents)) {
    throw new Error('[withAbiSplits] No top-level `android {` block found in build.gradle.');
  }

  const splits = [
    `    ${GENERATED_MARKER}`,
    '    splits {',
    '        abi {',
    '            enable true',
    '            reset()',
    `            include ${abis.map((abi) => `'${abi}'`).join(', ')}`,
    `            universalApk ${universalApk}`,
    '        }',
    '    }',
    '',
  ].join('\n');

  modConfig.modResults.contents = contents.replace(
    androidBlock,
    (match) => `${match}${splits}\n`
  );

  return modConfig;
});

module.exports = withAbiSplits;
