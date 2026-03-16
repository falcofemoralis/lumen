import { FilmSections } from 'Component/FilmSections';
import { InfoBlock } from 'Component/InfoBlock';
import { Page } from 'Component/Page';
import { Wrapper } from 'Component/Wrapper';
import { t } from 'i18n/translate';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { styles } from './NotificationsScreen.style';
import { NotificationsScreenComponentProps } from './NotificationsScreen.type';

export function NotificationsScreenComponent({
  data,
  isLoading,
  handleSelectFilm,
}: NotificationsScreenComponentProps) {
  const { top } = useSafeAreaInsets();

  if (!data.length && !isLoading) {
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

export default NotificationsScreenComponent;
