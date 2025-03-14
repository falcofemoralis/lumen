import FilmList from 'Component/FilmList';
import Page from 'Component/Page';
import ThemedText from 'Component/ThemedText';
import __ from 'i18n/__';
import React from 'react';
import { View } from 'react-native';

import { styles } from './NotificationsPage.style';
import { NotificationsPageThumbnail } from './NotificationsPage.thumbnail';
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
        <FilmList
          data={ data }
          handleOnPress={ handleSelectFilm }
        />
      </View>
    </Page>
  );
}

export default NotificationsPageComponent;
