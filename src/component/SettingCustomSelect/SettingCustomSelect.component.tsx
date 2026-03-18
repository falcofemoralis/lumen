import { SettingBase } from 'Component/SettingBase';
import { propsAreEqual } from 'Component/SettingBase/SettingBase.component';
import { ThemedCustomSelect } from 'Component/ThemedCustomSelect';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { memo, useCallback, useRef, useState } from 'react';
import { View } from 'react-native';

import { SettingCustomSelectComponentProps } from './SettingCustomSelect.type';

export const SettingCustomSelectComponent = memo(({
  setting,
  onUpdate,
}: SettingCustomSelectComponentProps) => {
  const {
    options,
    value,
  } = setting;
  const overlayRef = useRef<ThemedOverlayRef>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onChange = useCallback(async (val: string) => {
    setIsLoading(true);

    try {
      await onUpdate(setting, val);
    } catch (error) {
      console.log('error updating SettingCustomSelectComponent', error);
    } finally {
      setIsLoading(false);
    }
  }, [onUpdate, setting]);

  return (
    <View>
      <SettingBase
        setting={ setting }
        onPress={ () => overlayRef.current?.open() }
        isLoading={ isLoading }
      />
      <ThemedCustomSelect
        asOverlay
        overlayRef={ overlayRef }
        value={ value ?? '' }
        options={ (options ?? [] ).map((option) => option.value) }
        onSelect={ onChange }
      />
    </View>
  );
}, propsAreEqual);

export default SettingCustomSelectComponent;