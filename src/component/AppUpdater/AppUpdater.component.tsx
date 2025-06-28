import Loader from 'Component/Loader';
import ThemedBottomSheet from 'Component/ThemedBottomSheet';
import ThemedButton from 'Component/ThemedButton';
import ThemedPressable from 'Component/ThemedPressable';
import ThemedText from 'Component/ThemedText';
import Wrapper from 'Component/Wrapper';
import * as Application from 'expo-application';
import t from 'i18n/t';
import { X } from 'lucide-react-native';
import { Image, ScrollView, View } from 'react-native';
import { Colors } from 'Style/Colors';
import { scale } from 'Util/CreateStyles';

import { styles } from './AppUpdater.style';
import { AppUpdaterComponentProps } from './AppUpdater.type';

export const AppUpdaterComponent = ({
  update,
  isLoading,
  bottomSheetRef,
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

  const renderActions = () => (
    <View style={ styles.actions }>
      <ThemedButton
        style={ [
          styles.button,
          styles.skipButton,
        ] }
        onPress={ rejectUpdate }
      >
        { t('Reject') }
      </ThemedButton>
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
  );

  return (
    <ThemedBottomSheet
      ref={ bottomSheetRef }
      sizes={ ['auto'] }
      backgroundColor={ Colors.background }
      onMount={ onBottomSheetMount }
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
    </ThemedBottomSheet>
  );
};

export default AppUpdaterComponent;