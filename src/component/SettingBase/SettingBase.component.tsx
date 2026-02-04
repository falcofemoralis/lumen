import { ThemedPressable } from 'Component/ThemedPressable';
import { ThemedText } from 'Component/ThemedText';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { View } from 'react-native';
import { useAppTheme } from 'Theme/context';

import { componentStyles } from './SettingBase.style';
import { SettingBaseComponentProps } from './SettingBase.type';

const SettingBaseComponent = ({
  setting,
  onPress,
}: SettingBaseComponentProps) => {
  const { scale, theme } = useAppTheme();
  const styles = useThemedStyles(componentStyles);
  const { title, subtitle, isHidden, isEnabled, IconComponent, iconProps } = setting;

  if (isHidden) {
    return null;
  }

  return (
    <ThemedPressable
      style={ [styles.setting, !isEnabled && styles.settingHidden] }
      contentStyle={ styles.settingContainer }
      onPress={ () => isEnabled && onPress?.() }
    >
      <View style={ styles.settingWrapper }>
        { IconComponent && (
          <IconComponent
            style={ styles.settingIcon }
            size={ scale(20) }
            color={ isEnabled ? theme.colors.text : theme.colors.textSecondary }
            { ...iconProps }
          />
        ) }
        <View style={ styles.settingContent }>
          <ThemedText style={ styles.settingTitle }>
            { title }
          </ThemedText>
          { subtitle && (
            <ThemedText style={ styles.settingSubtitle }>
              { subtitle }
            </ThemedText>
          ) }
        </View>
      </View>
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