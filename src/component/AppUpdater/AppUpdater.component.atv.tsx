import { Loader } from 'Component/Loader';
import { ThemedButton } from 'Component/ThemedButton';
import { ThemedOverlay } from 'Component/ThemedOverlay';
import { ThemedText } from 'Component/ThemedText';
import * as Application from 'expo-application';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import { Image, View } from 'react-native';
// RN's own ScrollView never sees the touch stream here: the overlay's content is
// wrapped in a plain RN Pressable, which takes the JS responder and swallows the
// drag. The gesture-handler ScrollView competes in the native orchestrator
// instead, so the air-mouse drag reaches it (same one ThemedScrollView uses).
import { ScrollView } from 'react-native-gesture-handler';

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
      { /* Nothing inside is focusable, so the D-Pad cannot reach it -- the bar is
           kept up permanently as the only hint that there is more to scroll. */ }
      <ScrollView style={ styles.description } persistentScrollbar>
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
    <View style={ styles.actions }>
      <ThemedButton
        title={ t('Update') }
        autofocus
        style={ [
          styles.button,
          styles.updateButton,
        ] }
        onPress={ acceptUpdate }
      />
      <ThemedButton
        title={ t('Reject') }
        style={ [
          styles.button,
          styles.skipButton,
        ] }
        onPress={ rejectUpdate }
      />
    </View>
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
      <View style={ [
        styles.container,
        isLoading && styles.loadingContainer,
      ] }
      >
        { renderHeader() }
        { renderContent() }
        { renderActions() }
      </View>
    </ThemedOverlay>
  );
};

export default AppUpdaterComponent;