import { SettingBase } from 'Component/SettingBase';
import { ThemedCustomSelect } from 'Component/ThemedCustomSelect';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { memo, useCallback, useRef, useState } from 'react';
import { View } from 'react-native';

import { SettingCustomSelectComponentProps } from './SettingCustomSelect.type';

export const SettingCustomSelectComponent = memo(({
  value,
  options,
  onChange,
  ...baseProps
}: SettingCustomSelectComponentProps) => {
  const overlayRef = useRef<ThemedOverlayRef>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onSelect = useCallback(async (newValue: string) => {
    setIsLoading(true);

    try {
      await onChange(newValue);
    } catch (error) {
      console.error('Error in SettingCustomSelectComponent onChange:', error);
    } finally {
      setIsLoading(false);
    }
  }, [onChange]);

  return (
    <View>
      <SettingBase
        { ...baseProps }
        subtitle={ value }
        isLoading={ isLoading }
        onPress={ () => overlayRef.current?.open() }
      />
      <ThemedCustomSelect
        asOverlay
        overlayRef={ overlayRef }
        value={ value }
        options={ options }
        onSelect={ onSelect }
      />
    </View>
  );
});

export default SettingCustomSelectComponent;
