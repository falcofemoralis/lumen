import FilmCard from 'Component/FilmCard';
import { CARD_HEIGHT_TV } from 'Component/FilmCard/FilmCard.style.atv';
import FilmList from 'Component/FilmList';
import Loader from 'Component/Loader';
import Page from 'Component/Page';
import ThemedText from 'Component/ThemedText';
import Thumbnail from 'Component/Thumbnail';
import __ from 'i18n/__';
import React from 'react';
import { View } from 'react-native';
import {
  DefaultFocus,
} from 'react-tv-space-navigation';
import { FilmCardInterface } from 'Type/FilmCard.interface';
import { FilmType } from 'Type/FilmType.type';
import { scale } from 'Util/CreateStyles';
import { getWindowWidth } from 'Util/Window';

import { NUMBER_OF_COLUMNS_TV } from './NotificationsPage.config';
import { styles } from './NotificationsPage.style.atv';
import { NotificationsPageComponentProps } from './NotificationsPage.type';

// TODO: Rework
const containerWidth = getWindowWidth() - scale(16);

export function NotificationsPageComponent({
  isLoading,
  data,
  handleSelectFilm,
}: NotificationsPageComponentProps) {
  if (isLoading) {
    const filmThumbs = Array(NUMBER_OF_COLUMNS_TV).fill({
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
            height={ 48 }
            width={ 200 }
          />
          <View style={ {
            flexDirection: 'row',
            height: CARD_HEIGHT_TV,
            gap: 16,
            marginTop: 16,
          } }
          >
            { filmThumbs.map((item, i) => (
              <FilmCard
                // eslint-disable-next-line react/no-array-index-key
                key={ `${i}-notification-film-thumb` }
                filmCard={ item }
                style={ {
                  // TODO: Rework
                  width: containerWidth / NUMBER_OF_COLUMNS_TV - scale(16),
                } }
                isThumbnail
              />
            )) }
          </View>
          <Loader
            isLoading
            fullScreen
          />
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
