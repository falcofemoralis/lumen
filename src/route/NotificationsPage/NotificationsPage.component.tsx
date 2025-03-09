import FilmCard from 'Component/FilmCard';
import FilmList from 'Component/FilmList';
import Page from 'Component/Page';
import ThemedText from 'Component/ThemedText';
import Thumbnail from 'Component/Thumbnail';
import __ from 'i18n/__';
import React from 'react';
import { View } from 'react-native';
import { calculateItemSize } from 'Style/Layout';
import { FilmCardInterface } from 'Type/FilmCard.interface';
import { FilmType } from 'Type/FilmType.type';
import { scale } from 'Util/CreateStyles';

import { NUMBER_OF_COLUMNS } from './NotificationsPage.config';
import { styles } from './NotificationsPage.style';
import { NotificationsPageComponentProps } from './NotificationsPage.type';

export function NotificationsPageComponent({
  isLoading,
  data,
  handleSelectFilm,
}: NotificationsPageComponentProps) {
  const itemWidth = calculateItemSize(NUMBER_OF_COLUMNS);

  if (isLoading) {
    const filmThumbs = Array(NUMBER_OF_COLUMNS).fill({
      id: '',
      link: '',
      type: FilmType.FILM,
      poster: '',
      title: '',
      subtitle: '',
      isThumbnail: true,
    }) as FilmCardInterface[];

    return (
      <Page>
        <View>
          <Thumbnail
            height={ 24 }
            width={ 200 }
          />
          <View style={ {
            flexDirection: 'row',
            gap: scale(16),
            marginTop: scale(16),
          } }
          >
            { filmThumbs.map((item, i) => (
              <FilmCard
                // eslint-disable-next-line react/no-array-index-key
                key={ `${i}-notification-film-thumb` }
                filmCard={ item }
                style={ {
                  // TODO: Rework
                  width: itemWidth - scale(16),
                } }
                isThumbnail
              />
            )) }
          </View>
        </View>
      </Page>
    );
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
          numberOfColumns={ NUMBER_OF_COLUMNS }
        />
      </View>
    </Page>
  );
}

export default NotificationsPageComponent;
