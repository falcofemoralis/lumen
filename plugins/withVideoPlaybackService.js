'use strict';

/**
 * Declares react-native-video's media session service in the Android manifest.
 *
 * react-native-video's own `withAndroidNotificationControls` plugin tries to do
 * this with `mainApplication.service?.push(...)`. When the <application> element
 * has no <service> children yet - which is our case - the optional chaining makes
 * that a silent no-op, so VideoPlaybackService never reaches the manifest. Only
 * the two FOREGROUND_SERVICE permissions land, which is why the breakage is easy
 * to miss.
 *
 * Without the declaration `showNotificationControls = true` cannot start the
 * service (startForegroundService is wrapped in a try/catch that swallows the
 * failure), so no MediaSession is ever created - and the MediaSession is what
 * routes headset, bluetooth and lock screen media buttons to the player.
 *
 * Expo runs the mod of the *later* listed plugin first, so this is registered
 * before "react-native-video" in app.json in order to run last. It also drops any
 * declaration it finds for the same service before adding its own, so the result
 * is exactly one entry even if the upstream plugin manages to add one too.
 */

const { AndroidConfig, withAndroidManifest } = require('@expo/config-plugins');

const SERVICE_NAME = 'com.twg.video.core.services.playback.VideoPlaybackService';

const withVideoPlaybackService = (config) => withAndroidManifest(config, (modConfig) => {
  const mainApplication = AndroidConfig.Manifest.getMainApplication(modConfig.modResults);

  if (!mainApplication) {
    console.warn(
      '[withVideoPlaybackService] No <application> element found, skipping the media session service.'
    );

    return modConfig;
  }

  const services = (mainApplication.service ?? []).filter(
    (service) => service.$?.['android:name'] !== SERVICE_NAME
  );

  mainApplication.service = [
    ...services,
    {
      $: {
        'android:name': SERVICE_NAME,
        // media3 documents MediaSessionService as exported so system components
        // (media resumption, Android Auto, the notification controller) can bind
        'android:exported': 'true',
        'android:foregroundServiceType': 'mediaPlayback',
      },
      'intent-filter': [
        {
          action: [
            { $: { 'android:name': 'androidx.media3.session.MediaSessionService' } },
          ],
        },
      ],
    },
  ];

  return modConfig;
});

module.exports = withVideoPlaybackService;
