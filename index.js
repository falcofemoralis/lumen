import '@expo/metro-runtime';
import 'Util/Firestore/deprecated-warning';

import * as Sentry from '@sentry/react-native';
import { App } from 'expo-router/build/qualified-entry';
import { renderRootComponent } from 'expo-router/build/renderRootComponent';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
});

renderRootComponent(Sentry.wrap(App));