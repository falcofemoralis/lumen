import ThemedPressable from 'Component/ThemedPressable';
import ThemedText from 'Component/ThemedText';
import { View } from 'react-native';
import { Colors } from 'Style/Colors';
import { scale } from 'Util/CreateStyles';

import { styles } from './SettingBase.style.atv';
import { SettingBaseComponentProps } from './SettingBase.type';

const SettingBaseComponent = ({
  setting,
  onPress,
  onFocus,
}: SettingBaseComponentProps) => {
  const { title, subtitle, isHidden, isEnabled, IconComponent } = setting;

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
                color={ isFocused && isRootActive ? Colors.textFocused : Colors.text }
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