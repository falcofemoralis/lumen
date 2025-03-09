import Page from 'Component/Page';
import ThemedText from 'Component/ThemedText';
import React from 'react';

import { NotificationsPageComponentProps } from './NotificationsPage.type';

export function NotificationsPageComponent({
}: NotificationsPageComponentProps) {
  return (
    <Page>
      <ThemedText>
        Notif
      </ThemedText>
    </Page>
  );
}

export default NotificationsPageComponent;
