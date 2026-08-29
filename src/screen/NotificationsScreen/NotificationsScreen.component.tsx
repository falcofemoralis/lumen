import { FilmGrid } from 'Component/FilmGrid';
import { InfoBlock } from 'Component/InfoBlock';
import { Page } from 'Component/Page';
import { ThemedSafeArea } from 'Component/ThemedSafeArea';
import { Wrapper } from 'Component/Wrapper';
import { t } from 'i18n/translate';
import { View } from 'react-native';

import { styles } from './NotificationsScreen.style';
import { NotificationsScreenComponentProps } from './NotificationsScreen.type';

export function NotificationsScreenComponent({
  data,
  isLoading,
}: NotificationsScreenComponentProps) {
  if (!data.length && !isLoading) {
    return (
      <Page>
        <ThemedSafeArea>
          <View style={ styles.empty }>
            <InfoBlock
              title={ t('No notifications') }
              subtitle={ t('You have no notifications yet') }
            />
          </View>
        </ThemedSafeArea>
      </Page>
    );
  }

  return (
    <Page>
      <Wrapper>
        <View style={ styles.container }>
          <FilmGrid
            sections={ data }
          />
        </View>
      </Wrapper>
    </Page>
  );
}

export default NotificationsScreenComponent;
