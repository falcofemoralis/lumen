import { Loader } from 'Component/Loader';
import { SettingBase } from 'Component/SettingBase';
import { ThemedButton } from 'Component/ThemedButton';
import { ThemedDropdown } from 'Component/ThemedDropdown';
import { DropdownItem } from 'Component/ThemedDropdown/ThemedDropdown.type';
import { ThemedInput } from 'Component/ThemedInput';
import { ThemedOverlay } from 'Component/ThemedOverlay';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { ThemedText } from 'Component/ThemedText';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import { memo, useCallback, useRef, useState } from 'react';
import { View } from 'react-native';

import { componentStyles as inputStyles } from 'Component/SettingInput/SettingInput.style';
import { SettingSelectComponentProps } from './SettingSelect.type';

export const SettingSelectComponent = memo(({
  value,
  options,
  onChange,
  customValue,
  customInputTitle,
  onCustomChange,
  ...baseProps
}: SettingSelectComponentProps) => {
  const { title, subtitle } = baseProps;
  const styles = useThemedStyles(inputStyles);
  const { showSelectedValueInSubtitle = false } = baseProps;
  const overlayRef = useRef<ThemedOverlayRef>(null);
  const customOverlayRef = useRef<ThemedOverlayRef>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [customInputValue, setCustomInputValue] = useState(customValue || '#');
  const [hasCustomError, setHasCustomError] = useState(false);

  const selectedOption = options.find((option) => option.value === value);

  const onSelect = useCallback(async (option: DropdownItem) => {
    setIsLoading(true);

    try {
      if (await onChange(option.value) !== false) {
        overlayRef.current?.close();

        if (option.value === 'custom' && customValue !== undefined && onCustomChange) {
          setCustomInputValue(customValue || '#');
          setHasCustomError(false);

          setTimeout(() => {
            customOverlayRef.current?.open();
          }, 0);
        }
      }
    } catch (error) {
      console.error('Error in SettingSelectComponent onChange:', error);
    } finally {
      setIsLoading(false);
    }
  }, [onChange, customValue, onCustomChange]);

  const onCustomChangeText = useCallback((text: string) => {
    setCustomInputValue(text);
    setHasCustomError(false);
  }, []);

  const onCustomSave = useCallback(async () => {
    if (!customInputValue || !onCustomChange) {
      return;
    }

    const valueToSave = customInputValue.startsWith('#')
      ? customInputValue
      : `#${customInputValue}`;

    if (await onCustomChange(valueToSave) === false) {
      setHasCustomError(true);
      return;
    }

    customOverlayRef.current?.close();
  }, [customInputValue, onCustomChange]);

  return (
    <View>
      <SettingBase
        { ...baseProps }
        subtitle={ showSelectedValueInSubtitle && selectedOption
          ? [selectedOption.label, subtitle].filter(Boolean).join(' — ')
          : selectedOption ? selectedOption.label : subtitle }
        onPress={ () => overlayRef.current?.open() }
      />

      <ThemedDropdown
        asOverlay
        overlayRef={ overlayRef }
        value={ value }
        data={ options }
        onChange={ onSelect }
        header={ title }
      />

      { customValue !== undefined && onCustomChange && (
        <ThemedOverlay
          ref={ customOverlayRef }
          contentContainerStyle={ styles.overlay }
          onClose={ () => {
            setCustomInputValue(customValue || '#');
            setHasCustomError(false);
          } }
          useKeyboardAdjustment
        >
          <ThemedText style={ styles.overlayTitle }>
            { customInputTitle ?? title }
          </ThemedText>

          <ThemedInput
            style={ styles.overlayInput }
            placeholder={ customInputTitle ?? title }
            onChangeText={ onCustomChangeText }
            value={ customInputValue }
            multiline
          />

          <ThemedButton
            title={ t('Save') }
            style={ styles.overlayButton }
            onPress={ onCustomSave }
            disabled={ !customInputValue || hasCustomError }
          />
        </ThemedOverlay>
      )}

      { isLoading && (
        <Loader
          isLoading
          fullScreen
        />
      )}
    </View>
  );
});

export default SettingSelectComponent;
