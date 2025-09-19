import FilmSections from 'Component/FilmSections';
import InfoBlock from 'Component/InfoBlock';
import Page from 'Component/Page';
import Wrapper from 'Component/Wrapper';
import t from 'i18n/t';
import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { styles } from './NotificationsPage.style';
import { NotificationsPageThumbnail } from './NotificationsPage.thumbnail';
import { NotificationsPageComponentProps } from './NotificationsPage.type';

export function NotificationsPageComponent({
  isLoading,
  data,
  handleSelectFilm,
}: NotificationsPageComponentProps) {
  const { top } = useSafeAreaInsets();

  if (isLoading) {
    return <NotificationsPageThumbnail top={ top } />;
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
        >
          <View style={ { height: top } } />
        </FilmSections>
      </Wrapper>
    </Page>
  );
}

export default NotificationsPageComponent;
