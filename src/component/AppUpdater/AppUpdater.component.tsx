import { Loader } from 'Component/Loader';
import { ThemedBottomSheet } from 'Component/ThemedBottomSheet';
import { ThemedPressable } from 'Component/ThemedPressable';
import { ThemedText } from 'Component/ThemedText';
import { Wrapper } from 'Component/Wrapper';
import * as Application from 'expo-application';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import { X } from 'lucide-react-native';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAppTheme } from 'Theme/context';

import { componentStyles } from './AppUpdater.style';
import { AppUpdaterComponentProps } from './AppUpdater.type';

export const AppUpdaterComponent = ({
  update,
  isLoading,
  bottomSheetRef,
  progress,
  acceptUpdate,
  rejectUpdate,
  onBottomSheetMount,
}: AppUpdaterComponentProps) => {
  const { versionName, description } = update;
  const { scale, theme } = useAppTheme();
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
      <ThemedPressable
        style={ styles.closeBtn }
        contentStyle={ styles.closeBtnContent }
        onPress={ rejectUpdate }
      >
        <X
          style={ styles.closeIcon }
          size={ scale(20) }
          color={ theme.colors.icon }
        />
      </ThemedPressable>
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

  const cancelGesture = Gesture.Tap()
    .numberOfTaps(1)
    .maxDuration(500)
    .runOnJS(true)
    .onStart(() => {
      rejectUpdate();
    });

  const acceptGesture = Gesture.Tap()
    .numberOfTaps(1)
    .maxDuration(500)
    .runOnJS(true)
    .onStart(() => {
      acceptUpdate();
    });

  const renderActions = () => (
    <View style={ styles.actions }>
      <View style={ styles.buttonContainer }>
        <Pressable
          style={ [
            styles.button,
            styles.skipButton,
          ] }
          android_ripple={ {
            color: theme.colors.whiteTransparent,
          } }
        >
          <GestureDetector gesture={ cancelGesture }>
            <View style={ styles.buttonText }>
              <ThemedText>
                { t('Reject') }
              </ThemedText>
            </View>
          </GestureDetector>
        </Pressable>
      </View>
      <View style={ styles.buttonContainer }>
        <Pressable
          style={ [
            styles.button,
            styles.updateButton,
          ] }
          android_ripple={ {
            color: theme.colors.whiteTransparent,
          } }
        >
          <GestureDetector gesture={ acceptGesture }>
            <View style={ styles.buttonText }>
              <ThemedText>
                { t('Update') }
              </ThemedText>
            </View>
          </GestureDetector>
        </Pressable>
      </View>
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
    <ThemedBottomSheet
      ref={ bottomSheetRef }
      sizes={ ['auto'] }
      backgroundColor={ theme.colors.background }
      onMount={ onBottomSheetMount }
    >
      <GestureHandlerRootView style={ { flexGrow: 1 } }>
        { renderLoader() }
        <View style={ isLoading && styles.loadingContainer }>
          <Wrapper style={ styles.wrapper }>
            { renderHeader() }
            { renderContent() }
            { renderActions() }
          </Wrapper>
        </View>
      </GestureHandlerRootView>
    </ThemedBottomSheet>
  );
};

export default AppUpdaterComponent;