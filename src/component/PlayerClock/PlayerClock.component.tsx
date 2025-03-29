import ThemedText from 'Component/ThemedText';
import { View } from 'react-native';

import Clock from './Component';

export const PlayerClockComponent = () => (
  <View>
    <Clock
      element={ ThemedText }
      ticking
    />
  </View>
);

export default PlayerClockComponent;
