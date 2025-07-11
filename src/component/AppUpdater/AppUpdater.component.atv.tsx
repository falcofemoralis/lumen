import Loader from 'Component/Loader';
import ThemedButton from 'Component/ThemedButton';
import ThemedOverlay from 'Component/ThemedOverlay';
import ThemedText from 'Component/ThemedText';
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
  progress,
  acceptUpdate,
  rejectUpdate,
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
      <View style={ styles.buttonContainer }>
        <ThemedButton
          style={ [
            styles.button,
            styles.skipButton,
          ] }
          onPress={ rejectUpdate }
        >
          { t('Reject') }
        </ThemedButton>
      </View>
      <DefaultFocus>
        <View style={ styles.buttonContainer }>
          <ThemedButton
            style={ [
              styles.button,
              styles.updateButton,
            ] }
            onPress={ acceptUpdate }
          >
            { t('Update') }
          </ThemedButton>
        </View>
      </DefaultFocus>
    </SpatialNavigationView>
  );

  const renderLoader = () => {
    if (!isLoading) {
      return null;
    }

    return (
      <View style={ styles.loader }>
        <Loader isLoading />
        <ThemedText>
          { `${progress}%` }
        </ThemedText>
      </View>
    );
  };

  return (
    <ThemedOverlay
      id={ OVERLAY_APP_UPDATE_ID }
      containerStyle={ styles.overlay }
      onHide={ rejectUpdate }
    >
      { renderLoader() }
      <View style={ isLoading && styles.loadingContainer }>
        { renderHeader() }
        { renderContent() }
        { renderActions() }
      </View>
    </ThemedOverlay>
  );
};

export default AppUpdaterComponent;