import Loader from 'Component/Loader';
import ThemedButton from 'Component/ThemedButton';
import ThemedOverlay from 'Component/ThemedOverlay';
import ThemedText from 'Component/ThemedText';
import Wrapper from 'Component/Wrapper';
import * as Application from 'expo-application';
import t from 'i18n/t';
import { Image, ScrollView, View } from 'react-native';
import { DefaultFocus, SpatialNavigationView } from 'react-tv-space-navigation';

import { OVERLAY_APP_UPDATE_ID } from './AppUpdater.config';
import { styles } from './AppUpdater.style.atv';
import { AppUpdaterComponentProps } from './AppUpdater.type';

export const AppUpdaterComponent = ({
  update,
  isLoading,
  acceptUpdate,
  rejectUpdate,
  skipUpdate,
}: AppUpdaterComponentProps) => {
  const { versionName, description } = update;

  const renderHeader = () => (
    <View style={ styles.header }>
      <Image
        source={ require('../../../assets/images/icon.png') }
        style={ styles.headerIcon }
      />
      <ThemedText style={ styles.headerText }>
        { Application.applicationName }
      </ThemedText>
    </View>
  );

  const renderContent = () => (
    <>
      <ThemedText style={ styles.updateText }>
        { t('Update Available') }
      </ThemedText>
      <ThemedText style={ styles.versionText }>
        { t('%s to %s', Application.nativeApplicationVersion ?? '0.0.0', versionName) }
      </ThemedText>
      <ScrollView>
        <ThemedText style={ styles.newText }>
          { t('What\'s new') }
        </ThemedText>
        <ThemedText style={ styles.descriptionText }>
          { description }
        </ThemedText>
      </ScrollView>
    </>
  );

  const renderActions = () => (
    <SpatialNavigationView
      direction="horizontal"
      style={ styles.actions }
    >
      <ThemedButton
        style={ [
          styles.button,
          styles.skipButton,
        ] }
        onPress={ skipUpdate }
      >
        { t('Skip') }
      </ThemedButton>
      <ThemedButton
        style={ [
          styles.button,
          styles.skipButton,
        ] }
        onPress={ rejectUpdate }
      >
        { t('Reject') }
      </ThemedButton>
      <DefaultFocus>
        <ThemedButton
          style={ [
            styles.button,
            styles.updateButton,
          ] }
          onPress={ acceptUpdate }
        >
          { t('Update') }
        </ThemedButton>
      </DefaultFocus>
    </SpatialNavigationView>
  );

  return (
    <ThemedOverlay
      id={ OVERLAY_APP_UPDATE_ID }
      containerStyle={ styles.overlay }
      onHide={ rejectUpdate }
    >
      <View style={ isLoading && styles.loadingContainer }>
        <Wrapper style={ styles.wrapper }>
          <Loader
            fullScreen
            isLoading={ isLoading }
          />
          { renderHeader() }
          { renderContent() }
          { renderActions() }
        </Wrapper>
      </View>
    </ThemedOverlay>
  );
};

export default AppUpdaterComponent;