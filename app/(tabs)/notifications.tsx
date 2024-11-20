import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
import { TouchableOpacity } from 'react-native';

export default function NotificationsScreen() {
  return (
    <ThemedView>
      <TouchableOpacity>
        <ThemedText>Notifications page</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}
