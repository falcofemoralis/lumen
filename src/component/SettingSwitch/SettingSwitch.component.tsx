import { SettingBase } from 'Component/SettingBase';
import { ThemedToggle } from 'Component/ThemedToggle';
import { memo, useCallback } from 'react';
import { View } from 'react-native';

import { SettingSwitchComponentProps } from './SettingSwitch.type';

export const SettingSwitchComponent = memo(({
  value,
  onChange,
  ...baseProps
}: SettingSwitchComponentProps) => {
  const onPress = useCallback(async () => {
    await onChange(!value);
  }, [onChange, value]);

  return (
    <View>
      <SettingBase
        { ...baseProps }
        onPress={ onPress }
      >
        <ThemedToggle
          value={ value }
          status='disabled'
        />
      </SettingBase>
    </View>
  );
});

export default SettingSwitchComponent;
