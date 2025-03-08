import FilmList from 'Component/FilmList';
import Page from 'Component/Page';
import ThemedText from 'Component/ThemedText';
import React from 'react';
import { View } from 'react-native';
import {
  DefaultFocus,
} from 'react-tv-space-navigation';
import { FilmCardInterface } from 'Type/FilmCard.interface';

import { NUMBER_OF_COLUMNS_TV } from './NotificationsPage.config';
import { styles } from './NotificationsPage.style.atv';
import { NotificationsPageComponentProps } from './NotificationsPage.type';

export function NotificationsPageComponent({
  notifications,
  handleSelectFilm,
}: NotificationsPageComponentProps) {
  if (!notifications.length) {
    return <ThemedText>No</ThemedText>;
  }

  const rawData = notifications.map((notification) => ({
    header: notification.date,
    films: notification.items
      .filter((item) => item.film)
      .map((item) => item.film as FilmCardInterface),
  }));

  const data = rawData.filter((item) => item.films.length);

  return (
    <Page>
      <View style={ styles.container }>
        <DefaultFocus>
          <FilmList
            data={ data }
            handleOnPress={ handleSelectFilm }
            numberOfColumns={ NUMBER_OF_COLUMNS_TV }
          />
        </DefaultFocus>
      </View>
    </Page>
  );
}

export default NotificationsPageComponent;
