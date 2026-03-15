import { Page } from 'Component/Page';
import { SettingsStructure } from 'Component/SettingsStructure';

import { SettingsScreenComponentProps } from './SettingsScreen.type';

export function SettingsScreenComponent({
  settings,
  onSettingUpdate,
}: SettingsScreenComponentProps) {
  return (
    <Page
      checkConnection={ false }
    >
      <SettingsStructure settings={ settings } onSettingUpdate={ onSettingUpdate } />
    </Page>
  );
}

export default SettingsScreenComponent;
