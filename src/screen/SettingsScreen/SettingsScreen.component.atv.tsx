import { Page } from 'Component/Page';
import { SettingsStructure } from 'Component/SettingsStructure';
import { useAppTheme } from 'Theme/context';

import { SettingsScreenComponentProps } from './SettingsScreen.type';

export function SettingsScreenComponent({
  settings,
  onSettingUpdate,
}: SettingsScreenComponentProps) {
  const { scale } = useAppTheme();

  return (
    <Page
      checkConnection={ false }
      style={ { paddingBottom: scale(32) } }
    >
      <SettingsStructure settings={ settings } onSettingUpdate={ onSettingUpdate } />
    </Page>
  );
}

export default SettingsScreenComponent;
