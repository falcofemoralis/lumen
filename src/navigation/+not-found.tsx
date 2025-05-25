import ThemedText from 'Component/ThemedText';
import { Link, Stack } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={ { title: 'Oops!' } } />
      <View style={ styles.container }>
        <ThemedText type="title">This screen doesnt exist.</ThemedText>
        <Link
          href="./(tabs)"
          style={ styles.link }
        >
          <ThemedText type="link">Go to home screen!</ThemedText>
        </Link>
      </View>
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
