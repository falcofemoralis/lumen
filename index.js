import '@expo/metro-runtime';
import 'Util/Firestore/deprecated-warning';

import * as Sentry from '@sentry/react-native';
import { App } from 'expo-router/build/qualified-entry';
import { renderRootComponent } from 'expo-router/build/renderRootComponent';

Sentry.init({
    dsn: 'https://68f03037de05c4eab2b51ba6a4fdf01c@o4509107041533952.ingest.de.sentry.io/4509107041927248',
});

// This file should only import and register the root. No components or exports
// should be added here.
renderRootComponent(Sentry.wrap(App));