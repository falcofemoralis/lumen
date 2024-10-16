import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
import { TouchableOpacity } from 'react-native';

export default function HomeScreen() {
  return (
    <ThemedView>
      <TouchableOpacity onPress={() => console.log('Play Now')}>
        <ThemedText>PRESS Now</ThemedText>
      </TouchableOpacity>
      <ThemedText>This is a tab film page</ThemedText>
    </ThemedView>
  );
}
