import Page from 'Component/Page';
import SettingsStructure from 'Component/SettingsStructure';
import React from 'react';

import { styles } from './SettingsPage.style.atv';
import { SettingsPageComponentProps } from './SettingsPage.type';

export function SettingsPageComponent({
  settings,
  onSettingUpdate,
}: SettingsPageComponentProps) {
  return (
    <Page style={ styles.page }>
      <SettingsStructure settings={ settings } onSettingUpdate={ onSettingUpdate } />
    </Page>
  );
}

export default SettingsPageComponent;
