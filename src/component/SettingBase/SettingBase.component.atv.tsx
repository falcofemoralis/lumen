import { ThemedPressable } from 'Component/ThemedPressable';
import { ThemedText } from 'Component/ThemedText';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { View } from 'react-native';
import { useAppTheme } from 'Theme/context';

import { componentStyles } from './SettingBase.style.atv';
import { SettingBaseComponentProps } from './SettingBase.type';

const SettingBaseComponent = ({
  setting,
  onPress,
  onFocus,
}: SettingBaseComponentProps) => {
  const { scale, theme } = useAppTheme();
  const styles = useThemedStyles(componentStyles);
  const { title, subtitle, isHidden, isEnabled, IconComponent, iconProps, iconPropsFocused } = setting;

  if (isHidden) {
    return null;
  }

  return (
    <ThemedPressable
      onPress={ () => isEnabled && onPress?.() }
      onFocus={ onFocus }
      withAnimation
    >
      { ({ isFocused, isRootActive }) => (
        <View style={ [
          styles.setting,
          isFocused && isRootActive && styles.settingFocused,
          !isEnabled && styles.settingHidden,
        ] }
        >
          <View style={ styles.settingWrapper }>
            { IconComponent && (
              <IconComponent
                style={ styles.settingIcon }
                size={ scale(24) }
                color={ isFocused && isRootActive ? theme.colors.textFocused : theme.colors.text }
                { ...iconProps }
                { ...(isFocused && isRootActive ? iconPropsFocused : undefined) }
              />
            ) }
            <View style={ styles.settingContent }>
              <ThemedText style={ [
                styles.settingTitle,
                isFocused && isRootActive && styles.settingTitleFocused,
              ] }
              >
                { title }
              </ThemedText>
              { subtitle && (
                <ThemedText style={ [
                  styles.settingSubtitle,
                  isFocused && isRootActive && styles.settingSubtitleFocused,
                ] }
                >
                  { subtitle }
                </ThemedText>
              ) }
            </View>
          </View>
        </View>
      ) }
    </ThemedPressable>
  );
};

export function propsAreEqual(prevProps: SettingBaseComponentProps, props: SettingBaseComponentProps) {
  const {
    setting: {
      id,
      value,
      isEnabled,
      isHidden,
    },
  } = props;

  return prevProps.setting.id === id
      && prevProps.setting.value === value
      && prevProps.setting.isEnabled === isEnabled
      && prevProps.setting.isHidden === isHidden;
}

export default SettingBaseComponent;