import { ParamListBase, RouteProp } from '@react-navigation/native';
import { ThemedButton } from 'Component/ThemedButton';
import { ThemedText } from 'Component/ThemedText';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import { View } from 'react-native';
import { restartApp } from 'Util/Device';

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
      <ThemedButton
        title={ t('Retry') }
        onPress={ restartApp }
        autofocus
      />
    </View>
  );
}
