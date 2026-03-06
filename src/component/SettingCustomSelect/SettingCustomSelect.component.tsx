import { SettingBase } from 'Component/SettingBase';
import { propsAreEqual } from 'Component/SettingBase/SettingBase.component';
import { ThemedCustomSelect } from 'Component/ThemedCustomSelect';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { memo, useCallback, useRef } from 'react';
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

  const onChange = useCallback(async (val: string) => {
    await onUpdate(setting, val);
  }, [onUpdate, setting]);

  return (
    <View>
      <SettingBase
        setting={ setting }
        onPress={ () => overlayRef.current?.open() }
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