import InfoBlock from 'Component/InfoBlock';
import Page from 'Component/Page';
import ThemedButton from 'Component/ThemedButton';
import ThemedList from 'Component/ThemedList';
import ThemedText from 'Component/ThemedText';
import t from 'i18n/t';
import { View } from 'react-native';
import { DefaultFocus, SpatialNavigationFocusableView, SpatialNavigationView } from 'react-tv-space-navigation';
import ConfigStore from 'Store/Config.store';
import { LogEntry } from 'Store/Logger.store';
import { scale } from 'Util/CreateStyles';

import { styles } from './LoggerPage.style.atv';
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
      <SpatialNavigationFocusableView>
        { ({ isFocused }) => (
          <View
            style={ [
              styles.item,
              type === 'error' && styles.itemError,
              isFocused && styles.itemFocused,
            ] }
          >
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
        ) }
      </SpatialNavigationFocusableView>
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
      <DefaultFocus>
        <SpatialNavigationView
          style={ styles.actions }
          direction="horizontal"
        >
          <ThemedButton
            onPress={ sendLogs }
            style={ styles.action }
            disabled={ isSending || !data.length }
          >
            { t('Send') }
          </ThemedButton>
          <ThemedButton
            onPress={ clearLogs }
            style={ styles.action }
            disabled={ isSending || !data.length }
          >
            { t('Clear') }
          </ThemedButton>
          { renderDeviceId() }
        </SpatialNavigationView>
      </DefaultFocus>
    );
  };

  return (
    <Page>
      { renderActions() }
      { renderList() }
    </Page>
  );
};

export default LoggerPageComponent;