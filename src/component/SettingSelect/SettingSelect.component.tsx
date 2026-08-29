import { Loader } from 'Component/Loader';
import { SettingBase } from 'Component/SettingBase';
import { ThemedDropdown } from 'Component/ThemedDropdown';
import { DropdownItem } from 'Component/ThemedDropdown/ThemedDropdown.type';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { memo, useCallback, useRef, useState } from 'react';
import { View } from 'react-native';

import { SettingSelectComponentProps } from './SettingSelect.type';

export const SettingSelectComponent = memo(({
  value,
  options,
  onChange,
  ...baseProps
}: SettingSelectComponentProps) => {
  const { title, subtitle } = baseProps;
  const overlayRef = useRef<ThemedOverlayRef>(null);
  const [isLoading, setIsLoading] = useState(false);

  const selectedOption = options.find((option) => option.value === value);

  const onSelect = useCallback(async (option: DropdownItem) => {
    setIsLoading(true);

    try {
      if (await onChange(option.value) !== false) {
        overlayRef.current?.close();
      }
    } catch (error) {
      console.error('Error in SettingSelectComponent onChange:', error);
    } finally {
      setIsLoading(false);
    }
  }, [onChange]);

  return (
    <View>
      <SettingBase
        { ...baseProps }
        subtitle={ selectedOption ? selectedOption.label : subtitle }
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
      { /* Mounted only while loading -- an idle ActivityIndicator is still a
           native view, and a settings group renders a whole column of these. */ }
      { isLoading && (
        <Loader
          isLoading
          fullScreen
        />
      ) }
    </View>
  );
});

export default SettingSelectComponent;
