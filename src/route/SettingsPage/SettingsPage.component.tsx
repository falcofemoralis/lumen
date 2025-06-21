import Header from 'Component/Header';
import Page from 'Component/Page';
import t from 'i18n/t';
import React from 'react';
import { ScrollView, View } from 'react-native';

import {
  SettingItem, SettingsPageComponentProps,
  SettingType,
} from './SettingsPage.type';
import {
  SettingInput,
  SettingLink,
  SettingSelect,
  SettingText,
} from './SettingsPageElements';

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
    <ScrollView>
      { settings.map((setting) => (
        <View key={ setting.id }>
          { renderSetting(setting)[setting.type] }
        </View>
      )) }
    </ScrollView>
  );

  return (
    <Page>
      <Header title={ t('Settings') } />
      { renderSettings() }
    </Page>
  );
}

export default SettingsPageComponent;
