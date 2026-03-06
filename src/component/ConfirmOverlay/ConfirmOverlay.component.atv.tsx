import { ThemedButton } from 'Component/ThemedButton';
import { ThemedOverlay } from 'Component/ThemedOverlay';
import { ThemedText } from 'Component/ThemedText';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import { View } from 'react-native';
import { DefaultFocus, SpatialNavigationView } from 'react-tv-space-navigation';

import { componentStyles } from './ConfirmOverlay.style.atv';
import { ConfirmOverlayProps } from './ConfirmOverlay.type';

export const ConfirmOverlayComponent = ({
  overlayRef,
  title,
  message,
  onConfirm,
}: ConfirmOverlayProps) => {
  const styles = useThemedStyles(componentStyles);

  const onCancel = () => {
    overlayRef.current?.close();
  };

  return (
    <ThemedOverlay ref={ overlayRef } contentContainerStyle={ styles.overlay }>
      <View style={ styles.container }>
        <ThemedText style={ styles.title }>{ title }</ThemedText>
        { message && (
          <ThemedText style={ styles.message }>{ message }</ThemedText>
        ) }
        <SpatialNavigationView direction='horizontal'>
          <View style={ styles.actions }>
            <ThemedButton onPress={ onCancel } contentStyle={ styles.button }>
              { t('Cancel') }
            </ThemedButton>
            <DefaultFocus>
              <ThemedButton onPress={ onConfirm } contentStyle={ [styles.button, styles.buttonPrimary] }>
                { t('Accept') }
              </ThemedButton>
            </DefaultFocus>
          </View>
        </SpatialNavigationView>
      </View>
    </ThemedOverlay>
  );
};

export default ConfirmOverlayComponent;