import ThemedText from 'Component/ThemedText';
import { StyleSheet, Text, View } from 'react-native';

export default function Modal() {
  return (
    <View style={ styles.container }>
      <ThemedText>Modal screen</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});