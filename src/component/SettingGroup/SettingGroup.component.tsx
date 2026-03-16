import { SettingBase } from 'Component/SettingBase';
import { SETTINGS_MODAL_SCREEN } from 'Navigation/navigationRoutes';
import { View } from 'react-native';
import RouterStore from 'Store/Router.store';
import { navigate } from 'Util/Navigation';

import { SettingGroupComponentProps } from './SettingGroup.type';

const SettingGroupComponent = ({ setting, onUpdate }: SettingGroupComponentProps) => {
  const onPress = () => {
    RouterStore.pushData(SETTINGS_MODAL_SCREEN, {
      setting: setting,
      onSettingUpdate: onUpdate,
    });

    navigate(SETTINGS_MODAL_SCREEN);
  };

  return (
    <View>
      <SettingBase
        setting={ setting }
        onPress={ onPress }
      />
    </View>
  );
};

export default SettingGroupComponent;