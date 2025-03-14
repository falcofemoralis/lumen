import FilmList from 'Component/FilmList';
import Page from 'Component/Page';
import ThemedText from 'Component/ThemedText';
import __ from 'i18n/__';
import React from 'react';
import { View } from 'react-native';
import {
  DefaultFocus,
} from 'react-tv-space-navigation';

import { styles } from './NotificationsPage.style.atv';
import { NotificationsPageThumbnail } from './NotificationsPage.thumbnail.atv';
import { NotificationsPageComponentProps } from './NotificationsPage.type';

export function NotificationsPageComponent({
  isLoading,
  data,
  handleSelectFilm,
}: NotificationsPageComponentProps) {
  if (isLoading) {
    return <NotificationsPageThumbnail />;
  }

  if (!data.length) {
    return (
      <Page>
        <View style={ styles.empty }>
          <ThemedText style={ styles.emptyText }>
            { __('No notifications') }
          </ThemedText>
        </View>
      </Page>
    );
  }

  return (
    <Page>
      <View style={ styles.container }>
        <DefaultFocus>
          <FilmList
            data={ data }
            handleOnPress={ handleSelectFilm }
          />
        </DefaultFocus>
      </View>
    </Page>
  );
}

export default NotificationsPageComponent;
