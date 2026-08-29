import { ThemedButton } from 'Component/ThemedButton';
import { ThemedOverlay } from 'Component/ThemedOverlay';
import { ThemedText } from 'Component/ThemedText';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import { View } from 'react-native';

import { componentStyles } from './ConfirmOverlay.style.atv';
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
    <ThemedOverlay ref={ overlayRef } contentContainerStyle={ styles.overlay }>
      <View style={ styles.container }>
        <ThemedText style={ styles.title }>{ title }</ThemedText>
        { message && (
          <ThemedText style={ styles.message }>{ message }</ThemedText>
        ) }
        <View style={ styles.actions }>
          <ThemedButton
            title={ confirmButtonText ?? t('Accept') }
            onPress={ onConfirm }
            contentStyle={ styles.button }
            style={ styles.buttonPrimary }
            styleFocused={ styles.buttonPrimaryFocused }
            textStyleFocused={ styles.buttonPrimaryTextFocused }
          />
          { !disableCancelButton && (
            <ThemedButton
              title={ cancelButtonText ?? t('Cancel') }
              onPress={ onCancel }
              contentStyle={ styles.button }
            />
          ) }
        </View>
      </View>
    </ThemedOverlay>
  );
};

export default ConfirmOverlayComponent;