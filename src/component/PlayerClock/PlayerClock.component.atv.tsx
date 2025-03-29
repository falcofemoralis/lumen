import ThemedText from 'Component/ThemedText';
import { View } from 'react-native';
import Colors from 'Style/Colors';
import { scale } from 'Util/CreateStyles';

import Clock from './Component';

export const PlayerClockComponent = () => (
  <View
    style={ {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'flex-end',
    } }
  >
    <Clock
      style={ {
        color: Colors.white,
        fontSize: scale(16),
        alignSelf: 'flex-end',
      } }
      element={ ThemedText }
      ticking
    />
  </View>
);

export default PlayerClockComponent;
