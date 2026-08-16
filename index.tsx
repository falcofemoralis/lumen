import '@expo/metro-runtime'; // this is for fast refresh on web w/o expo-router

import { registerRootComponent } from 'expo';
import { AppRegistry } from 'react-native';

import { App } from './src/App';
import { TV_CHANNELS_SYNC_TASK, tvChannelsSyncTask } from './src/util/TvChannels/backgroundTask';
import { TV_SEARCH_QUERY_TASK, tvSearchQueryTask } from './src/util/TvSearch/backgroundTask';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);

// Registered at module scope, next to the root component: when the background sync
// job loads this bundle there is no App to mount, and the task has to already be
// known by the time the native side asks for it.
AppRegistry.registerHeadlessTask(TV_CHANNELS_SYNC_TASK, () => tvChannelsSyncTask);

// Same, for the search the TV global search box asks for. Here the app is not merely
// closed but was started *by* the search, so this registration is the first thing the
// bundle does that the provider is waiting on.
AppRegistry.registerHeadlessTask(TV_SEARCH_QUERY_TASK, () => tvSearchQueryTask);
