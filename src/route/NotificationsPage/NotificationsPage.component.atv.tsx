import FilmSections from 'Component/FilmSections';
import InfoBlock from 'Component/InfoBlock';
import Page from 'Component/Page';
import ThemedText from 'Component/ThemedText';
import t from 'i18n/t';
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
          <InfoBlock
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
        <DefaultFocus>
          <FilmSections
            data={ data }
            handleOnPress={ handleSelectFilm }
          />
        </DefaultFocus>
      </View>
    </Page>
  );
}

export default NotificationsPageComponent;
