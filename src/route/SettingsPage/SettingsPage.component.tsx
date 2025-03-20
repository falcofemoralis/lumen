import Page from 'Component/Page';
import ThemedIcon from 'Component/ThemedIcon';
import { IconPackType } from 'Component/ThemedIcon/ThemedIcon.type';
import ThemedText from 'Component/ThemedText';
import { router } from 'expo-router';
import __ from 'i18n/__';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { scale } from 'Util/CreateStyles';

import { styles } from './SettingsPage.style';
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
  const renderTopActions = () => (
    <View style={ styles.topActions }>
      <TouchableOpacity
        style={ styles.topActionsButton }
        onPress={ () => router.back() }
      >
        <ThemedIcon
          icon={ {
            name: 'arrow-back',
            pack: IconPackType.MaterialIcons,
          } }
          size={ scale(28) }
          color="white"
        />
      </TouchableOpacity>
      <ThemedText style={ styles.title }>
        { __('Settings') }
      </ThemedText>
    </View>
  );

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
      { renderTopActions() }
      { renderSettings() }
    </Page>
  );
}

export default SettingsPageComponent;
