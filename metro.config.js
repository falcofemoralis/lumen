// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.transformer.getTransformOptions = async () => ({
  transform: {
    // Inline requires are very useful for deferring loading of large dependencies/components.
    // For example, we use it in app.tsx to conditionally load Reactotron.
    // However, this comes with some gotchas.
    // Read more here: https://reactnative.dev/docs/optimizing-javascript-loading
    // And here: https://github.com/expo/expo/issues/27279#issuecomment-1971610698
    inlineRequires: true,
  },
});

// This is a temporary fix that helps fixing an issue with axios/apisauce.
// See the following issues in Github for more details:
// https://github.com/infinitered/apisauce/issues/331
// https://github.com/axios/axios/issues/6899
// The solution was taken from the following issue:
// https://github.com/facebook/metro/issues/1272
config.resolver.unstable_conditionNames = ['require', 'default', 'browser'];

// This helps support certain popular third-party libraries
// such as Firebase that use the extension cjs.
config.resolver.sourceExts.push('cjs');

const path = require('node:path');
const windowsAliases = {
  '@kesha-antonov/react-native-background-downloader': 'downloads.js',
  'expo-file-system': 'files.js',
  'Util/Download': 'download-utils.js',
  'expo-intent-launcher': 'intents.js',
  'expo-file-system/legacy': 'files.js',
  'react-native-nitro-google-signin': 'google.js',
  '@react-native-clipboard/clipboard': 'clipboard.js',
  'expo-application': 'application.js',
  'expo-keep-awake': 'awake.js',
  'expo-screen-orientation': 'orientation.js',
  'react-native-mmkv': 'mmkv.js',
  'react-native-webview': 'webview.jsx',
  'react-native-pager-view': 'pager.jsx',
  'react-native-gesture-handler': 'gestures.js',
  'react-native-video': 'video.jsx',
  'react-native-youtube-bridge': 'youtube.jsx',
  'react-native-keyboard-controller': 'native.jsx',
  'react-native-keyevent': 'native.jsx',
  'react-native-volume-manager': 'native.jsx',
  'react-native-restart': 'native.jsx',
  '@logicwind/react-native-exit-app': 'native.jsx',
  '@lodev09/react-native-true-sheet': 'native.jsx',
  '@react-native-firebase/app': 'firebase.js',
  '@react-native-firebase/firestore': 'firebase.js',
};
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && moduleName === '@noriginmedia/norigin-spatial-navigation-react-native-tvos')
    return { type: 'sourceFile', filePath: path.join(__dirname, 'node_modules/@noriginmedia/norigin-spatial-navigation-react-native-tvos/dist/index.web.mjs') };
  if (platform === 'web' && windowsAliases[moduleName])
    return { type: 'sourceFile', filePath: path.join(__dirname, 'src/windows', windowsAliases[moduleName]) };
  if (platform === 'web' && moduleName.startsWith('Modules/react-native-'))
    return { type: 'sourceFile', filePath: path.join(__dirname, 'src/windows/native.jsx') };
  return context.resolveRequest(context, moduleName, platform);
};
module.exports = config;
