import { Header } from 'Component/Header';
import { Page } from 'Component/Page';
import { SettingsStructure } from 'Component/SettingsStructure';
import { ThemedSafeArea } from 'Component/ThemedSafeArea';
import { t } from 'i18n/translate';

import { SettingsScreenComponentProps } from './SettingsScreen.type';

export function SettingsScreenComponent({
  settings,
  onSettingUpdate,
}: SettingsScreenComponentProps) {
  return (
    <Page checkConnection={ false }>
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

export default SettingsScreenComponent;
