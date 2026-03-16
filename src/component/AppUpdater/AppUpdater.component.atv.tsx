import { Loader } from 'Component/Loader';
import { ThemedButton } from 'Component/ThemedButton';
import { ThemedOverlay } from 'Component/ThemedOverlay';
import { ThemedText } from 'Component/ThemedText';
import * as Application from 'expo-application';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import { Image, ScrollView, View } from 'react-native';
import { DefaultFocus, SpatialNavigationView } from 'react-tv-space-navigation';

import { componentStyles } from './AppUpdater.style.atv';
import { AppUpdaterComponentProps } from './AppUpdater.type';

export const AppUpdaterComponent = ({
  update,
  isLoading,
  progress,
  overlayRef,
  acceptUpdate,
  rejectUpdate,
}: AppUpdaterComponentProps) => {
  const { versionName, description } = update;
  const styles = useThemedStyles(componentStyles);

  const renderHeader = () => (
    <View style={ styles.header }>
      <Image
        source={ require('../../../assets/images/app-icon-all.png') }
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
        { t('{{versionFrom}} to {{versionTo}}', {
          versionFrom: Application.nativeApplicationVersion ?? '0.0.0',
          versionTo: versionName,
        }) }
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
      ref={ overlayRef }
      containerStyle={ styles.overlay }
      onClose={ rejectUpdate }
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