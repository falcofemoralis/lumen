import InfoBlock from 'Component/InfoBlock';
import Page from 'Component/Page';
import ThemedButton from 'Component/ThemedButton';
import ThemedInput from 'Component/ThemedInput';
import ThemedList from 'Component/ThemedList';
import ThemedPressable from 'Component/ThemedPressable';
import ThemedText from 'Component/ThemedText';
import t from 'i18n/t';
import { useState } from 'react';
import { View } from 'react-native';
import { DefaultFocus, SpatialNavigationView } from 'react-tv-space-navigation';
import ConfigStore from 'Store/Config.store';
import { LogEntry } from 'Store/Logger.store';
import NotificationStore from 'Store/Notification.store';
import { scale } from 'Util/CreateStyles';
import { simpleHash } from 'Util/Hash';

import { styles } from './LoggerPage.style.atv';
import { LoggerPageProps } from './LoggerPage.type';

const SendModal = ({ onClose }: {onClose: () => void}) => {
  const [key, setKey] = useState('');

  const sendLogs = () => {
    if (!key) {
      return;
    }

    const generatedKey = simpleHash(ConfigStore.getDeviceId(true));

    if (generatedKey !== key) {
      NotificationStore.displayError(new Error('Invalid key'));

      return;
    }

    onClose();
  };

  return (
    <View>
      <DefaultFocus>
        <ThemedText style={ styles.hint }>
          { t('Contact developer') }
        </ThemedText>
        <ThemedInput
          placeholder={ t('Enter developer key') }
          onChangeText={ (text) => setKey(text) }
        />
        <ThemedText />
        <ThemedButton
          onPress={ sendLogs }
          disabled={ !key }
        >
          { t('Send') }
        </ThemedButton>
      </DefaultFocus>
    </View>
  );
};

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
    } = item;

    return (
      <ThemedPressable>
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
          </View>
        ) }
      </ThemedPressable>
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
          { ConfigStore.getDeviceId(true) }
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
            style={ [styles.action, styles.actionPrimary] }
            disabled={ isSending || !data.length }
            withAnimation
          >
            { t('Send') }
          </ThemedButton>
          <ThemedButton
            onPress={ clearLogs }
            style={ styles.action }
            disabled={ isSending || !data.length }
            withAnimation
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