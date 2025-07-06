import Loader from 'Component/Loader';
import ThemedBottomSheet from 'Component/ThemedBottomSheet';
import ThemedPressable from 'Component/ThemedPressable';
import ThemedText from 'Component/ThemedText';
import Wrapper from 'Component/Wrapper';
import * as Application from 'expo-application';
import t from 'i18n/t';
import { X } from 'lucide-react-native';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { Colors } from 'Style/Colors';
import { scale } from 'Util/CreateStyles';

import { styles } from './AppUpdater.style';
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

  const renderHeader = () => (
    <View style={ styles.header }>
      <Image
        source={ require('../../../assets/images/icon.png') }
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
          color={ Colors.white }
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
      <Pressable
        style={ [
          styles.button,
          styles.skipButton,
        ] }
        android_ripple={ {
          color: Colors.whiteTransparent,
        } }
      >
        <GestureDetector gesture={ cancelGesture }>
          <ThemedText>
            { t('Reject') }
          </ThemedText>
        </GestureDetector>
      </Pressable>
      <Pressable
        style={ [
          styles.button,
          styles.updateButton,
        ] }
        android_ripple={ {
          color: Colors.whiteTransparent,
        } }
      >
        <GestureDetector gesture={ acceptGesture }>
          <ThemedText>
            { t('Update') }
          </ThemedText>
        </GestureDetector>
      </Pressable>
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
      backgroundColor={ Colors.background }
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