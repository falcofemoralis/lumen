import SettingBase from 'Component/SettingBase';
import { View } from 'react-native';

import { SettingGroupComponentProps } from './SettingGroup.type';

const SettingGroupComponent = ({
  setting,
  onSelect,
}: SettingGroupComponentProps) => {
  return (
    <View>
      <SettingBase
        setting={ setting }
        onFocus={ () => onSelect?.(setting) }
      />
    </View>
  );
};

export default SettingGroupComponent;