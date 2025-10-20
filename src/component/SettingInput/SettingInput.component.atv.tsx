import Loader from 'Component/Loader';
import SettingBase from 'Component/SettingBase';
import { propsAreEqual } from 'Component/SettingBase/SettingBase.component.atv';
import ThemedButton from 'Component/ThemedButton';
import ThemedInput from 'Component/ThemedInput';
import ThemedOverlay from 'Component/ThemedOverlay';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import ThemedText from 'Component/ThemedText';
import t from 'i18n/t';
import { memo, useCallback, useRef, useState } from 'react';
import { View } from 'react-native';
import { DefaultFocus } from 'react-tv-space-navigation';

import { styles } from './SettingInput.style.atv';
import { SettingInputComponentProps } from './SettingInput.type';

export const SettingInputComponent = memo(({
  setting,
  onUpdate,
}: SettingInputComponentProps) => {
  const {
    title,
    value,
  } = setting;
  const overlayRef = useRef<ThemedOverlayRef>(null);
  const [inputValue, setInputValue] = useState(value);
  const [isLoading, setIsLoading] = useState(false);
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

    setIsLoading(true);

    const success = await onUpdate(setting, inputValue);

    if (success) {
      overlayRef.current?.close();
    } else {
      setHasError(true);
    }

    setIsLoading(false);
  }, [onUpdate, setting.id, inputValue]);

  return (
    <View>
      <SettingBase
        setting={ setting }
        onPress={ () => overlayRef.current?.open() }
      />
      <ThemedOverlay
        ref={ overlayRef }
        contentContainerStyle={ styles.overlay }
        onClose={ () => setInputValue(value) }
        useKeyboardAdjustment
      >
        <DefaultFocus>
          <ThemedText style={ styles.overlayTitle }>
            { title }
          </ThemedText>
          <ThemedInput
            style={ styles.overlayInput }
            placeholder={ title }
            onChangeText={ onChangeText }
            defaultValue={ value || '' }
            multiline
          />
          <ThemedButton
            style={ styles.overlayButton }
            onPress={ onSave }
            disabled={ !inputValue || isLoading || hasError }
          >
            { t('Save') }
          </ThemedButton>
          <Loader
            isLoading={ isLoading }
            fullScreen
          />
        </DefaultFocus>
      </ThemedOverlay>
    </View>
  );
}, propsAreEqual);

export default SettingInputComponent;