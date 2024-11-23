import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
import { TouchableOpacity } from 'react-native';

export default function BookmarksScreen() {
  return (
    <ThemedView>
      <TouchableOpacity>
        <ThemedText>Bookmarks page</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}
