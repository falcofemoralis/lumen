import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';
import Colors from 'Style/Colors';

export default function ErrorScreen() {
  const { code = '500', error = 'ERROR!', info } = useLocalSearchParams() as {
    code: string;
    error: string;
    info?: string;
  };

  return (
    <ThemedView style={ styles.container }>
      <ThemedText style={ styles.code }>{ code.trim() }</ThemedText>
      <ThemedText style={ styles.text }>{ error.trim() }</ThemedText>
      { info && (
        <ThemedText style={ styles.text }>
          { info.trim() }
        </ThemedText>
      ) }
    </ThemedView>
  );
}

export const styles = StyleSheet.create({
  // eslint-disable-next-line react-native/no-unused-styles
  boundaryError: {
    height: '100%',
    padding: 20,
  },
  // eslint-disable-next-line react-native/no-unused-styles
  boundaryErrorText: {
    fontSize: 16,
  },
  code: {
    color: Colors.secondary,
    fontSize: 24,
    fontWeight: '700',
  },
  container: {
    alignItems: 'center',
    flex: 1,
    gap: 20,
    justifyContent: 'center',
    padding: 20,
  },
  text: {
    fontSize: 16,
  },
});
