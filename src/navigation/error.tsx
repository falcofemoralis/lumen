import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';

export default function ErrorScreen() {
  const { code = '500', error = 'ERROR!', info } = useLocalSearchParams();

  return (
    <ThemedView style={ styles.container }>
      <ThemedText type="title">{ code }</ThemedText>
      <ThemedText type="title">{ error }</ThemedText>
      { info && (
        <ThemedText type="subtitle">
          { info }
        </ThemedText>
      ) }
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
});
