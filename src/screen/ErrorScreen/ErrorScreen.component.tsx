import { ParamListBase, RouteProp } from '@react-navigation/native';
import { ThemedText } from 'Component/ThemedText';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { View } from 'react-native';

import { componentStyles } from './ErrorScreen.styles';

export default function ErrorScreen({ route }: { route: RouteProp<ParamListBase, string> }) {
  const { code = '500', error = 'ERROR!', info } = route.params as {
    code: string;
    error: string;
    info?: string;
  };
  const styles = useThemedStyles(componentStyles);

  return (
    <View style={ styles.container }>
      <ThemedText style={ styles.code }>{ code.trim() }</ThemedText>
      <ThemedText style={ styles.text }>{ error.trim() }</ThemedText>
      { info && (
        <ThemedText style={ styles.text }>
          { info.trim() }
        </ThemedText>
      ) }
    </View>
  );
}
