import { useIsFocused } from '@react-navigation/native';
import { SettingGroup } from 'Component/SettingGroup';
import { SettingInput } from 'Component/SettingInput';
import { SettingLink } from 'Component/SettingLink';
import { SettingSelect } from 'Component/SettingSelect';
import { SettingText } from 'Component/SettingText';
import { useNavigationContext } from 'Context/NavigationContext';
import { useOverlayContext } from 'Context/OverlayContext';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { useEffect, useRef, useState } from 'react';
import { useWindowDimensions, View } from 'react-native';
import {
  DefaultFocus,
  SpatialNavigationRoot,
  SpatialNavigationScrollView,
  SpatialNavigationView,
  useLockSpatialNavigation,
} from 'react-tv-space-navigation';
import { SettingItem, SettingType } from 'Screen/SettingsScreen/SettingsScreen.type';
import { ThemedStyles } from 'Theme/types';
import RemoteControlManager from 'Util/RemoteControl/RemoteControlManager';
import { SupportedKeys } from 'Util/RemoteControl/SupportedKeys';

import { componentStyles } from './SettingsStructure.style.atv';
import { SettingsStructureComponentProps } from './SettingsStructure.type';

const SettingGroupPage = ({
  settings,
  groupId,
  selectedGroupId,
  isActive,
  renderSetting,
  styles,
}: {
  settings: SettingItem[];
  groupId: string;
  selectedGroupId: string;
  isActive: boolean;
  renderSetting: (setting: SettingItem) => Record<SettingType, React.ReactNode>
  styles: ThemedStyles<typeof componentStyles>;
}) => {
  const { height } = useWindowDimensions();
  const { lock, unlock } = useLockSpatialNavigation();
  const { isOverlayOpen } = useOverlayContext();
  const prevIsOverlayOpen = useRef(isOverlayOpen);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    if (prevIsOverlayOpen.current !== isOverlayOpen) {
      if (prevIsOverlayOpen.current) {
        unlock();
      } else {
        lock();
      }

      prevIsOverlayOpen.current = isOverlayOpen;
    }
  }, [isActive, isOverlayOpen, lock, unlock]);

  return (
    <SpatialNavigationView
      direction='vertical'
      style={ [styles.tabContainer, groupId !== selectedGroupId && styles.tabContainerHidden] }
    >
      <View style={ styles.tab }>
        <SpatialNavigationScrollView offsetFromStart={ height / 2.1 }>
          { settings?.map((setting) => (
            <View key={ `inner-${setting.id}` } style={ styles.tabButton }>
              { renderSetting(setting)[setting.type] }
            </View>
          )) ?? null }
        </SpatialNavigationScrollView>
      </View>
    </SpatialNavigationView>
  );
};

export const SettingsStructureComponent = ({
  settings,
  onSettingUpdate,
}: SettingsStructureComponentProps) => {
  const styles = useThemedStyles(componentStyles);
  const { height } = useWindowDimensions();
  const [settingsGroupId, setSettingsGroupId] = useState<string>(settings[0].id);
  const [isGroupFocused, setIsGroupFocused] = useState<boolean>(false);
  const { lock, unlock } = useLockSpatialNavigation();
  const { isMenuOpen } = useNavigationContext();
  const isFocused = useIsFocused();

  useEffect(() => {
    const keyDownListener = (type: SupportedKeys) => {
      if (!isFocused) {
        return false;
      }

      if (!isMenuOpen) {
        if (type === SupportedKeys.RIGHT && !isGroupFocused) {
          setIsGroupFocused(true);
          lock();
        }

        if (type === SupportedKeys.LEFT && isGroupFocused) {
          setIsGroupFocused(false);
          unlock();
        }
      }

      return false;
    };

    RemoteControlManager.addKeydownListener(keyDownListener);

    return () => {
      RemoteControlManager.removeKeydownListener(keyDownListener);
    };
  }, [isMenuOpen, isFocused, isGroupFocused, lock, unlock]);

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
        <DefaultFocus>
          <SpatialNavigationView direction='vertical' style={ styles.tabContainer }>
            <View style={ styles.tab }>
              <SpatialNavigationScrollView offsetFromStart={ height / 2.1 }>
                { settings.map((setting) => (
                  <View key={ `tab-${setting.id}` } style={ styles.tabButton }>
                    { renderSetting(setting)[setting.type] }
                  </View>
                )) }
              </SpatialNavigationScrollView>
            </View>
          </SpatialNavigationView>
        </DefaultFocus>
        { settings.map(setting => {
          const isActive = isGroupFocused && setting.id === settingsGroupId;

          return (
            <SpatialNavigationRoot key={ `group-${setting.id}` } isActive={ isActive }>
              <DefaultFocus>
                <SettingGroupPage
                  settings={ setting.settings ?? [] }
                  groupId={ setting.id }
                  selectedGroupId={ settingsGroupId }
                  renderSetting={ renderSetting }
                  isActive={ isActive }
                  styles={ styles }
                />
              </DefaultFocus>
            </SpatialNavigationRoot>
          );
        }) }
      </View>
    </SpatialNavigationView>
  );
};

export default SettingsStructureComponent;