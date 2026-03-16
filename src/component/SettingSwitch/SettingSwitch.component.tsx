import { SettingBase } from 'Component/SettingBase';
import { propsAreEqual } from 'Component/SettingBase/SettingBase.component';
import { ThemedToggle } from 'Component/ThemedToggle';
import { memo, useCallback } from 'react';
import { View } from 'react-native';
import { convertBooleanToString, convertStringToBoolean } from 'Util/Type';

import { SettingSwitchComponentProps } from './SettingSwitch.type';

export const SettingSwitchComponent = memo(({
  setting,
  onUpdate,
}: SettingSwitchComponentProps) => {
  const { value } = setting;

  const onChange = useCallback(async () => {
    const actualValue = convertStringToBoolean(value ?? '');

    await onUpdate(setting, convertBooleanToString(!actualValue));
  }, [onUpdate, setting, value]);

  return (
    <View>
      <SettingBase
        setting={ setting }
        onPress={ onChange }
      >
        <ThemedToggle
          value={ convertStringToBoolean(value ?? '') }
          status='disabled'
        />
      </SettingBase>
    </View>
  );
}, propsAreEqual);

export default SettingSwitchComponent;