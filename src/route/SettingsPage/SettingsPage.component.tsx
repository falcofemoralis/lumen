import Header from 'Component/Header';
import Page from 'Component/Page';
import SettingsStructure from 'Component/SettingsStructure';
import ThemedSafeArea from 'Component/ThemedSafeArea';
import t from 'i18n/t';
import React from 'react';

import { SettingsPageComponentProps } from './SettingsPage.type';

export function SettingsPageComponent({
  settings,
  onSettingUpdate,
}: SettingsPageComponentProps) {
  return (
    <Page>
      <ThemedSafeArea>
        <Header title={ t('Settings') } />
        <SettingsStructure
          settings={ settings }
          onSettingUpdate={ onSettingUpdate }
        />
      </ThemedSafeArea>
    </Page>
  );
}

export default SettingsPageComponent;
