import Header from 'Component/Header';
import InfoBlock from 'Component/InfoBlock';
import Page from 'Component/Page';
import ThemedButton from 'Component/ThemedButton';
import ThemedList from 'Component/ThemedList';
import ThemedText from 'Component/ThemedText';
import t from 'i18n/t';
import { View } from 'react-native';
import ConfigStore from 'Store/Config.store';
import { LogEntry } from 'Store/Logger.store';
import { scale } from 'Util/CreateStyles';

import { styles } from './LoggerPage.style';
import { LoggerPageProps } from './LoggerPage.type';

export const LoggerPageComponent = ({
  data,
  isSending,
  sendLogs,
  clearLogs,
}: LoggerPageProps) => {
  const renderItem = ({ item }: { item: LogEntry }) => {
    const {
      type,
      timestamp,
      message,
      context,
      deviceInfo,
    } = item;

    return (
      <View style={ [styles.item, type === 'error' && styles.itemError] }>
        <ThemedText style={ styles.itemDate }>
          { timestamp }
        </ThemedText>
        <ThemedText>
          <ThemedText style={ styles.itemTitle }>
            Action:
          </ThemedText>
          { ' ' }
          { message }
        </ThemedText>
        <ThemedText>
          <ThemedText style={ styles.itemTitle }>
            Context:
          </ThemedText>
          { ' ' }
          { JSON.stringify(context) }
        </ThemedText>
        <ThemedText>
          <ThemedText style={ styles.itemTitle }>
            Device Info:
          </ThemedText>
          { ' ' }
          { JSON.stringify(deviceInfo) }
        </ThemedText>
      </View>
    );
  };

  const renderEmpty = () => {
    return (
      <View style={ styles.empty }>
        <InfoBlock
          title={ t('No logs') }
          subtitle={ t('You have no logs yet') }
        />
      </View>
    );
  };

  const renderHeader = () => (
    <Header title={ t('Logger') } />
  );

  const renderList = () => {
    if (!data.length) {
      return renderEmpty();
    }

    return (
      <ThemedList
        data={ data }
        renderItem={ renderItem }
        keyExtractor={ (item, idx) => `${item.timestamp}-log-${idx}` }
        estimatedItemSize={ scale(160) }
      />
    );
  };

  const renderDeviceId = () => {
    return (
      <View style={ styles.device }>
        <ThemedText style={ styles.deviceTitle }>
          { t('Device id') }
        </ThemedText>
        <ThemedText style={ styles.deviceValue }>
          { ConfigStore.getDeviceId() }
        </ThemedText>
      </View>
    );
  };

  const renderActions = () => {
    return (
      <View style={ styles.actions }>
        <ThemedButton
          onPress={ clearLogs }
          style={ styles.action }
          disabled={ isSending || !data.length }
        >
          { t('Clear') }
        </ThemedButton>
        <ThemedButton
          onPress={ sendLogs }
          style={ styles.action }
          disabled={ isSending || !data.length }
        >
          { t('Send') }
        </ThemedButton>
      </View>
    );
  };

  return (
    <Page>
      { renderHeader() }
      { renderList() }
      { renderDeviceId() }
      { renderActions() }
    </Page>
  );
};

export default LoggerPageComponent;