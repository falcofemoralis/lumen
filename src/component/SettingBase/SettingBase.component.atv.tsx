import { ConfirmOverlay } from 'Component/ConfirmOverlay';
import { Loader } from 'Component/Loader';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { ThemedPressable } from 'Component/ThemedPressable';
import { ThemedText } from 'Component/ThemedText';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { useCallback, useRef, useState } from 'react';
import { View } from 'react-native';
import { useAppTheme } from 'Theme/context';

import { componentStyles } from './SettingBase.style.atv';
import { SettingBaseComponentProps } from './SettingBase.type';

const SettingBaseComponent = ({
  setting,
  children,
  onPress,
  onFocus,
}: SettingBaseComponentProps) => {
  const { scale, theme } = useAppTheme();
  const styles = useThemedStyles(componentStyles);
  const {
    title,
    subtitle,
    isHidden,
    isEnabled,
    IconComponent,
    iconProps,
    iconPropsFocused,
    confirmation,
    withLoader,
  } = setting;

  const confirmOverlayRef = useRef<ThemedOverlayRef>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleOnPress = useCallback(async (confirmAcquired: boolean = false) => {
    if (!isEnabled || isLoading) {
      return;
    }

    if (confirmation && !confirmAcquired) {
      confirmOverlayRef.current?.open();

      return;
    }

    if (confirmation && confirmAcquired) {
      confirmOverlayRef.current?.close();
    }

    if (withLoader) {
      setIsLoading(true);
    }

    try {
      await onPress?.();
    } catch (error) {
      console.error('Error in SettingBaseComponent onPress:', error);
    } finally {
      if (withLoader) {
        setIsLoading(false);
      }
    }
  }, [confirmation, isEnabled, isLoading, onPress, withLoader]);

  if (isHidden) {
    return null;
  }

  return (
    <>
      <ThemedPressable
        onPress={ () => handleOnPress() }
        onFocus={ onFocus }
        withAnimation
      >
        { ({ isFocused, isRootActive }) => (
          <View style={ [
            styles.setting,
            isFocused && isRootActive && styles.settingFocused,
            (!isEnabled || isLoading) && styles.settingHidden,
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
              { children && (
                <View style={ styles.settingAdditionalElement }>
                  { children }
                </View>
              ) }
              { withLoader && (
                <Loader isLoading={ isLoading } fullScreen />
              ) }
            </View>
          </View>
        ) }
      </ThemedPressable>
      { confirmation && (
        <ConfirmOverlay
          overlayRef={ confirmOverlayRef }
          onConfirm={ () => handleOnPress(true) }
          title={ confirmation.title }
          message={ confirmation.message }
        />
      ) }
    </>
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