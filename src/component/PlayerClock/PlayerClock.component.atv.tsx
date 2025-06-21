import { View } from 'react-native';
import { Colors } from 'Style/Colors';
import { scale } from 'Util/CreateStyles';

import ReactLiveClock from './ReactLiveClock';

export const PlayerClockComponent = () => (
  <View
    style={ {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'flex-end',
    } }
  >
    <ReactLiveClock
      style={ {
        color: Colors.text,
        fontSize: scale(16),
        alignSelf: 'flex-end',
      } }
    />
  </View>
);

export default PlayerClockComponent;
