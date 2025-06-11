import FilmSections from 'Component/FilmSections';
import InfoBlock from 'Component/InfoBlock';
import Page from 'Component/Page';
import Wrapper from 'Component/Wrapper';
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
      <Wrapper style={ styles.container }>
        <FilmSections
          data={ data }
          handleOnPress={ handleSelectFilm }
        />
      </Wrapper>
    </Page>
  );
}

export default NotificationsPageComponent;
