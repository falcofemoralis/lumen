import ThemedText from 'Component/ThemedText';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors } from 'Style/Colors';

export default function ErrorScreen() {
  const { code = '500', error = 'ERROR!', info } = useLocalSearchParams() as {
    code: string;
    error: string;
    info?: string;
  };

  return (
    <View style={ styles.container }>
      <ThemedText style={ styles.code }>{ code.trim() }</ThemedText>
      <ThemedText style={ styles.text }>{ error.trim() }</ThemedText>
      { info && (
        <ThemedText style={ styles.text }>
          { info.trim() }
        </ThemedText>
      ) }
    </View>
  );
}

export const styles = StyleSheet.create({
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
