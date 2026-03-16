import { View } from 'react-native';
import { useAppTheme } from 'Theme/context';

import ReactLiveClock from './ReactLiveClock';

export const PlayerClockComponent = () => {
  const { scale, theme } = useAppTheme();

  return (
    <View
      style={ {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
      } }
    >
      <ReactLiveClock
        style={ {
          color: theme.colors.textOnContrast,
          fontSize: scale(16),
          alignSelf: 'flex-end',
        } }
      />
    </View>
  );
};

export default PlayerClockComponent;
