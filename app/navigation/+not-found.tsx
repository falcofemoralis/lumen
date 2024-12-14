import { Link, Stack } from 'expo-router';
import { StyleSheet } from 'react-native';

import ThemedView from 'Component/ThemedView';
import ThemedText from 'Component/ThemedText';
import React from 'react';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <ThemedView style={styles.container}>
        <ThemedText type="title">This screen doesnt exist.</ThemedText>
        <Link
          href="./(tabs)"
          style={styles.link}
        >
          <ThemedText type="link">Go to home screen!</ThemedText>
        </Link>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
