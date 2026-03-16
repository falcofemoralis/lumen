import { FilmSections } from 'Component/FilmSections';
import { InfoBlock } from 'Component/InfoBlock';
import { Page } from 'Component/Page';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import { View } from 'react-native';
import { DefaultFocus } from 'react-tv-space-navigation';

import { componentStyles } from './NotificationsScreen.style.atv';
import { NotificationsScreenComponentProps } from './NotificationsScreen.type';

export function NotificationsScreenComponent({
  data,
  isLoading,
  handleSelectFilm,
}: NotificationsScreenComponentProps) {
  const styles = useThemedStyles(componentStyles);

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

export default NotificationsScreenComponent;
