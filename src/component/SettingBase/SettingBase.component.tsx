import { ConfirmOverlay } from 'Component/ConfirmOverlay';
import { Loader } from 'Component/Loader';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { ThemedPressable } from 'Component/ThemedPressable';
import { ThemedText } from 'Component/ThemedText';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { useCallback, useRef, useState } from 'react';
import { View } from 'react-native';
import { useAppTheme } from 'Theme/context';

import { componentStyles } from './SettingBase.style';
import { SettingBaseComponentProps } from './SettingBase.type';

const SettingBaseComponent = ({
  setting,
  children,
  onPress,
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
        style={ [styles.setting, (!isEnabled || isLoading) && styles.settingHidden] }
        contentStyle={ styles.settingContainer }
        onPress={ () => handleOnPress() }
      >
        { IconComponent && (
          <View style={ styles.settingIcon }>
            <IconComponent
              size={ scale(20) }
              color={ isEnabled ? theme.colors.text : theme.colors.textSecondary }
              { ...iconProps }
            />
          </View>
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
        { children && (
          <View style={ styles.settingAdditionalElement }>
            { children }
          </View>
        ) }
        { withLoader && (
          <Loader isLoading={ isLoading } fullScreen />
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