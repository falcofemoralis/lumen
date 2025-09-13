import { withTV } from 'Hooks/withTV';
import t from 'i18n/t';
import { useState } from 'react';
import LoggerStore, { LogEntry } from 'Store/Logger.store';
import NotificationStore from 'Store/Notification.store';

import LoggerPageComponent from './LoggerPage.component';
import LoggerPageComponentTV from './LoggerPage.component.atv';

export function LoggerPageContainer() {
  const [data, setData] = useState<LogEntry[]>(LoggerStore.getAll());
  const [isSending, setIsSending] = useState(false);

  const sendLogs = async () => {
    if (!data.length) {
      NotificationStore.displayMessage(t('No logs to send!'));

      return;
    }

    try {
      setIsSending(true);

      await LoggerStore.send();

      setData([]);

      NotificationStore.displayMessage(t('Logs sent successfully!'));
    } catch (error) {
      LoggerStore.error('sendLogs', { error });

      NotificationStore.displayError(error as Error);
    } finally {
      setIsSending(false);
    }
  };

  const clearLogs = () => {
    LoggerStore.clear();

    setData([]);

    NotificationStore.displayMessage(t('Logs cleared successfully!'));
  };

  const containerProps = () => ({
    data,
    isSending,
    sendLogs,
    clearLogs,
  });

  return withTV(LoggerPageComponentTV, LoggerPageComponent, containerProps());
}

export default LoggerPageContainer;
