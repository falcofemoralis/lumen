import { useNavigation } from '@react-navigation/native';
import SettingBase from 'Component/SettingBase';
import { SETTINGS_MODAL_ROUTE } from 'Navigation/routes';
import { View } from 'react-native';
import RouterStore from 'Store/Router.store';

import { SettingGroupComponentProps } from './SettingGroup.type';

const SettingGroupComponent = ({ setting, onUpdate }: SettingGroupComponentProps) => {
  const navigation = useNavigation();

  const onPress = () => {
    RouterStore.pushData(SETTINGS_MODAL_ROUTE, {
      setting: setting,
      onSettingUpdate: onUpdate,
    });

    navigation.navigate(SETTINGS_MODAL_ROUTE);
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