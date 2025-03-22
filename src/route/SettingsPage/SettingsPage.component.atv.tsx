import Page from 'Component/Page';
import React from 'react';
import { View } from 'react-native';
import { DefaultFocus, SpatialNavigationScrollView } from 'react-tv-space-navigation';

import {
  SettingItem, SettingsPageComponentProps,
  SettingType,
} from './SettingsPage.type';
import {
  SettingInput,
  SettingLink,
  SettingSelect,
  SettingText,
} from './SettingsPageElements.atv';

export function SettingsPageComponent({
  settings,
  onSettingUpdate,
}: SettingsPageComponentProps) {
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
  });

  const renderSettings = () => (
    <DefaultFocus>
      <SpatialNavigationScrollView>
        { settings.map((setting) => (
          <View key={ setting.id }>
            { renderSetting(setting)[setting.type] }
          </View>
        )) }
      </SpatialNavigationScrollView>
    </DefaultFocus>
  );

  return (
    <Page>
      { renderSettings() }
    </Page>
  );
}

export default SettingsPageComponent;
