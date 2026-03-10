import { ThemedButton } from 'Component/ThemedButton';
import { ThemedOverlay } from 'Component/ThemedOverlay';
import { ThemedText } from 'Component/ThemedText';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import { View } from 'react-native';

import { componentStyles } from './ConfirmOverlay.style';
import { ConfirmOverlayProps } from './ConfirmOverlay.type';

export const ConfirmOverlayComponent = ({
  overlayRef,
  title,
  message,
  confirmButtonText,
  cancelButtonText,
  onConfirm,
}: ConfirmOverlayProps) => {
  const styles = useThemedStyles(componentStyles);

  const onCancel = () => {
    overlayRef.current?.close();
  };

  return (
    <ThemedOverlay ref={ overlayRef }>
      <View style={ styles.container }>
        <ThemedText style={ styles.title }>{ title }</ThemedText>
        { message && (
          <ThemedText style={ styles.message }>{ message }</ThemedText>
        ) }
        <View style={ styles.actions }>
          <ThemedButton onPress={ onCancel } contentStyle={ styles.button }>
            { cancelButtonText ?? t('Cancel') }
          </ThemedButton>
          <ThemedButton onPress={ onConfirm } contentStyle={ [styles.button, styles.buttonPrimary] }>
            { confirmButtonText ?? t('Accept') }
          </ThemedButton>
        </View>
      </View>
    </ThemedOverlay>
  );
};

export default ConfirmOverlayComponent;