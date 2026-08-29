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
  disableCancelButton,
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
          { !disableCancelButton && (
            <ThemedButton
              title={ cancelButtonText ?? t('Cancel') }
              onPress={ onCancel }
              style={ styles.button }
              contentStyle={ styles.buttonContent }
            />
          ) }
          <ThemedButton
            title={ confirmButtonText ?? t('Accept') }
            onPress={ onConfirm }
            style={ [styles.button, styles.buttonPrimary] }
            contentStyle={ styles.buttonContent }
          />
        </View>
      </View>
    </ThemedOverlay>
  );
};

export default ConfirmOverlayComponent;