import { SafeAreaView } from 'react-native-safe-area-context';
import WelcomePage from 'Route/WelcomePage';
import { Colors } from 'Style/Colors';

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={ { flex: 1, backgroundColor: Colors.background } }>
      <WelcomePage />
    </SafeAreaView>
  );
}
