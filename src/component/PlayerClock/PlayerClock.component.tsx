import { View } from 'react-native';
import { useAppTheme } from 'Theme/context';

import ReactLiveClock from './ReactLiveClock';

export const PlayerClockComponent = () => {
  const { theme } = useAppTheme();

  return (
    <View>
      <ReactLiveClock style={ { color: theme.colors.textOnContrast } } />
    </View>
  );
};

export default PlayerClockComponent;
