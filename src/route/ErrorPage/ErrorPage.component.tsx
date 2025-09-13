import { ParamListBase, RouteProp } from '@react-navigation/native';
import ThemedText from 'Component/ThemedText';
import React from 'react';
import { View } from 'react-native';
import { Colors } from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export default function ErrorScreen({ route }: { route: RouteProp<ParamListBase, string> }) {
  const { code = '500', error = 'ERROR!', info } = route.params as {
    code: string;
    error: string;
    info?: string;
  };

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

export const styles = CreateStyles({
  code: {
    color: Colors.secondary,
    fontSize: 24,
    fontWeight: '700',
  },
  container: {
    alignItems: 'center',
    flex: 1,
    gap: 20,
    justifyContent: 'center',
    padding: 20,
  },
  text: {
    fontSize: 16,
  },
});
