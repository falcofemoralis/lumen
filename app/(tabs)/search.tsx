import ThemedText from 'Component/ThemedText';
import ThemedTouchableOpacity from 'Component/ThemedTouchableOpacity';
import ThemedView from 'Component/ThemedView';
import { TouchableOpacity } from 'react-native';

export default function SearchScreen() {
  return (
    <ThemedView>
      <ThemedTouchableOpacity>
        <ThemedText>Search page</ThemedText>
      </ThemedTouchableOpacity>
    </ThemedView>
  );
}
