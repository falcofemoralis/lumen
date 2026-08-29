import { SettingBase } from 'Component/SettingBase';
import { ThemedButton } from 'Component/ThemedButton';
import { ThemedInput } from 'Component/ThemedInput';
import { ThemedOverlay } from 'Component/ThemedOverlay';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { ThemedText } from 'Component/ThemedText';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import { memo, useCallback, useRef, useState } from 'react';
import { View } from 'react-native';

import { componentStyles } from './SettingInput.style.atv';
import { SettingInputComponentProps } from './SettingInput.type';

export const SettingInputComponent = memo(({
  value,
  onChange,
  ...baseProps
}: SettingInputComponentProps) => {
  const { title } = baseProps;
  const styles = useThemedStyles(componentStyles);
  const overlayRef = useRef<ThemedOverlayRef>(null);
  const [inputValue, setInputValue] = useState(value);
  const [hasError, setHasError] = useState(false);

  const onChangeText = useCallback((text: string) => {
    setInputValue(text);

    if (hasError) {
      setHasError(false);
    }
  }, [hasError]);

  const onSave = useCallback(async () => {
    if (!inputValue) {
      return;
    }

    if (inputValue === value) {
      overlayRef.current?.close();

      return;
    }

    if (await onChange(inputValue) === false) {
      setHasError(true);

      return;
    }

    overlayRef.current?.close();
  }, [inputValue, value, onChange]);

  return (
    <View>
      <SettingBase
        { ...baseProps }
        subtitle={ value }
        onPress={ () => overlayRef.current?.open() }
      />
      <ThemedOverlay
        ref={ overlayRef }
        contentContainerStyle={ styles.overlay }
        onClose={ () => setInputValue(value) }
        useKeyboardAdjustment
      >
        <ThemedText style={ styles.overlayTitle }>
          { title }
        </ThemedText>
        <ThemedInput
          style={ styles.overlayInput }
          placeholder={ title }
          onChangeText={ onChangeText }
          defaultValue={ value }
          multiline
        />
        <ThemedButton
          title={ t('Save') }
          style={ styles.overlayButton }
          onPress={ onSave }
          disabled={ !inputValue || hasError }
        />
      </ThemedOverlay>
    </View>
  );
});

export default SettingInputComponent;
