import { InfoBlock } from 'Component/InfoBlock';
import { ThemedButton } from 'Component/ThemedButton';
import { t } from 'i18n/translate';
import { View } from 'react-native';

export const SourceLoadError = ({ onRetry }: { onRetry: () => void }) => (
  <View style={ { flex: 1, justifyContent: 'center', padding: 20 } }>
    <InfoBlock title={ t('Network error') }
      subtitle="Источник недоступен или не ответил вовремя. Повторите попытку." />
    <ThemedButton title={ t('Retry') } onPress={ onRetry } />
  </View>
);
