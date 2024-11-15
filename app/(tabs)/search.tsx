import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
import { TouchableOpacity } from 'react-native';

export default function SearchScreen() {
  return (
    <ThemedView>
      <TouchableOpacity>
        <ThemedText>Search page</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}
