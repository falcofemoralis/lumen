import FilmSections from 'Component/FilmSections';
import Page from 'Component/Page';
import ThemedInfo from 'Component/ThemedInfo';
import ThemedText from 'Component/ThemedText';
import t from 'i18n/t';
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
          <ThemedInfo
            title={ t('No notifications') }
            subtitle={ t('You have no notifications yet') }
          />
        </View>
      </Page>
    );
  }

  return (
    <Page>
      <View style={ styles.container }>
        <FilmSections
          data={ data }
          handleOnPress={ handleSelectFilm }
        />
      </View>
    </Page>
  );
}

export default NotificationsPageComponent;
