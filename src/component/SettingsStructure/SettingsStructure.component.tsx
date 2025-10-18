import SettingGroup from 'Component/SettingGroup';
import SettingInput from 'Component/SettingInput';
import SettingLink from 'Component/SettingLink';
import SettingSelect from 'Component/SettingSelect';
import SettingText from 'Component/SettingText';
import { ScrollView, View } from 'react-native';
import { SettingItem, SettingType } from 'Route/SettingsPage/SettingsPage.type';

import { SettingsStructureComponentProps } from './SettingsStructure.type';

export const SettingsStructureComponent = ({
  settings,
  onSettingUpdate,
}: SettingsStructureComponentProps) => {
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
  });

  return (
    <ScrollView>
      { settings.map((setting) => (
        <View key={ setting.id }>
          { renderSetting(setting)[setting.type] }
        </View>
      )) }
    </ScrollView>
  );
};

export default SettingsStructureComponent;