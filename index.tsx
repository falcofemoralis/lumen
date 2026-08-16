import '@expo/metro-runtime'; // this is for fast refresh on web w/o expo-router

import { registerRootComponent } from 'expo';
import { AppRegistry } from 'react-native';

import { App } from './src/App';
import { TV_CHANNELS_SYNC_TASK, tvChannelsSyncTask } from './src/util/TvChannels/backgroundTask';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);

// Registered at module scope, next to the root component: when the background sync
// job loads this bundle there is no App to mount, and the task has to already be
// known by the time the native side asks for it.
AppRegistry.registerHeadlessTask(TV_CHANNELS_SYNC_TASK, () => tvChannelsSyncTask);
