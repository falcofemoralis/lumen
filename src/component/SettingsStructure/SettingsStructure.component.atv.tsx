import SettingGroup from 'Component/SettingGroup';
import SettingInput from 'Component/SettingInput';
import SettingLink from 'Component/SettingLink';
import SettingSelect from 'Component/SettingSelect';
import SettingText from 'Component/SettingText';
import { useState } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { DefaultFocus, SpatialNavigationScrollView, SpatialNavigationView } from 'react-tv-space-navigation';
import { SettingItem, SettingType } from 'Route/SettingsPage/SettingsPage.type';

import { styles } from './SettingsStructure.style.atv';
import { SettingsStructureComponentProps } from './SettingsStructure.type';

export const SettingsStructureComponent = ({
  settings,
  onSettingUpdate,
}: SettingsStructureComponentProps) => {
  const { height } = useWindowDimensions();
  const [settingsGroupId, setSettingsGroupId] = useState<string>(settings[0].id);

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
        onSelect={ (s) => setSettingsGroupId(s.id) }
      />
    ),
  });

  return (
    <SpatialNavigationView direction='horizontal'>
      <View style={ styles.container }>
        <SpatialNavigationView direction='vertical' style={ styles.tabContainer }>
          <View style={ styles.tab }>
            <DefaultFocus>
              <SpatialNavigationScrollView offsetFromStart={ height / 2.1 }>
                { settings.map((setting) => (
                  <View key={ setting.id }>
                    { renderSetting(setting)[setting.type] }
                  </View>
                )) }
              </SpatialNavigationScrollView>
            </DefaultFocus>
          </View>
        </SpatialNavigationView>
        <SpatialNavigationView direction='vertical' style={ styles.tabContainer }>
          <View style={ styles.tab }>
            <SpatialNavigationScrollView offsetFromStart={ height / 2.1 }>
              { settings.find((s) => s.id === settingsGroupId)?.settings?.map((setting) => (
                <View key={ setting.id }>
                  { renderSetting(setting)[setting.type] }
                </View>
              )) ?? null }
            </SpatialNavigationScrollView>
          </View>
        </SpatialNavigationView>
      </View>
    </SpatialNavigationView>
  );
};

export default SettingsStructureComponent;