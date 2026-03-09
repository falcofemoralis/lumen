import { SettingCustomSelect } from 'Component/SettingCustomSelect';
import { SettingGroup } from 'Component/SettingGroup';
import { SettingInput } from 'Component/SettingInput';
import { SettingLink } from 'Component/SettingLink';
import { SettingSelect } from 'Component/SettingSelect';
import { SettingSwitch } from 'Component/SettingSwitch';
import { SettingText } from 'Component/SettingText';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SettingItem, SettingType } from 'Screen/SettingsScreen/SettingsScreen.type';

import { SettingsStructureComponentProps } from './SettingsStructure.type';

export const SettingsStructureComponent = ({
  settings,
  onSettingUpdate,
}: SettingsStructureComponentProps) => {
  const { bottom } = useSafeAreaInsets();

  const renderSetting = (setting: SettingItem): Record<SettingType, React.ReactNode> => ({
    TEXT: (
      <SettingText
        setting={ setting }
        onUpdate={ onSettingUpdate }
      />
    ),
    INPUT: (
      <SettingInput
        setting={ setting }
        onUpdate={ onSettingUpdate }
      />
    ),
    SELECT: (
      <SettingSelect
        setting={ setting }
        onUpdate={ onSettingUpdate }
      />
    ),
    LINK: (
      <SettingLink
        setting={ setting }
        onUpdate={ onSettingUpdate }
      />
    ),
    GROUP: (
      <SettingGroup
        setting={ setting }
        onUpdate={ onSettingUpdate }
      />
    ),
    SWITCH: (
      <SettingSwitch
        setting={ setting }
        onUpdate={ onSettingUpdate }
      />
    ),
    CUSTOM_SELECT: (
      <SettingCustomSelect
        setting={ setting }
        onUpdate={ onSettingUpdate }
      />
    ),
  });

  return (
    <ScrollView>
      { settings.map((setting) => (
        <View key={ setting.id }>
          { renderSetting(setting)[setting.type] }
        </View>
      )) }
      <View style={ { height: bottom } } />
    </ScrollView>
  );
};

export default SettingsStructureComponent;