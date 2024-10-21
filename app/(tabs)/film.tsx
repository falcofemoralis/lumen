import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
import { router } from 'expo-router';
import { TouchableOpacity } from 'react-native';

export default function HomeScreen() {
  return (
    <ThemedView>
      <TouchableOpacity onPress={() => router.replace('/player')}>
        <ThemedText>PRESS Now</ThemedText>
      </TouchableOpacity>
      <ThemedText>This is a tab film page</ThemedText>
    </ThemedView>
  );
}
